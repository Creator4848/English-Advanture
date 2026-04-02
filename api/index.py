"""
index.py  –  English Adventure FastAPI main entrypoint
All routers registered here: Auth, Videos, Quiz, Progress, Speaking Club.
"""
import os
import shutil
from typing import Optional

from fastapi import (
    FastAPI, Depends, HTTPException, UploadFile, File,
    Query, WebSocket
)
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import get_db, engine, redis_set_progress, redis_get_progress
import models
from models import (
    User, Video, Quiz, QuizQuestion, QuizResult,
    VideoProgress, SpeakingSession, Achievement, UserAchievement,
)
from schemas import (
    RegisterRequest, LoginRequest, TokenResponse,
    VideoOut, ProgressUpdateRequest, ProgressOut,
    QuizOut, QuizQuestionOut, QuizOptionOut,
    QuizSubmitRequest, QuizResultOut,
    SpeakingSessionOut, DashboardOut,
)
import auth_service, speech, adaptive, llm_service
from quiz_service      import QuizService
from youtube_service   import YouTubeService
# from speaking_service import speaking_partner_ws, SPEAKING_TOPICS (Moved to routes)
from demo_seed         import seed_demo_data

# ── DB init (Moved to startup for stability) ──────────────────────────────────
@app.on_event("startup")
async def startup_event():
    try:
        models.Base.metadata.create_all(bind=engine)
        print("✅ Database tables created")
        from database import SessionLocal
        with SessionLocal() as db:
            seed_demo_data(db)
            print("✅ Demo data seeded")
    except Exception as e:
        print(f"⚠️  DB startup error: {e}")


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="English Adventure API",
    version="2.0.0",
    description="Backend for the English Adventure EdTech platform",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Service singletons (Lazy loading for health check stability) ──────────────
_voice_analyzer = None
_mission_gen = None
_adaptive_engine = None
_quiz_svc = None
_yt_svc = None

def get_voice_analyzer():
    global _voice_analyzer
    if _voice_analyzer is None:
        import speech
        _voice_analyzer = speech.VoiceAnalyzer()
    return _voice_analyzer

def get_mission_gen():
    global _mission_gen
    if _mission_gen is None:
        import llm_service
        _mission_gen = llm_service.MissionGenerator()
    return _mission_gen

def get_adaptive_engine():
    global _adaptive_engine
    if _adaptive_engine is None:
        import adaptive
        _adaptive_engine = adaptive.AdaptiveEngine()
    return _adaptive_engine

def get_quiz_svc():
    global _quiz_svc
    if _quiz_svc is None:
        from quiz_service import QuizService
        _quiz_svc = QuizService()
    return _quiz_svc

def get_yt_svc():
    global _yt_svc
    if _yt_svc is None:
        from youtube_service import YouTubeService
        _yt_svc = YouTubeService()
    return _yt_svc


# ═════════════════════════════════════════════════════════════════════════════
# HEALTH
# ═════════════════════════════════════════════════════════════════════════════
@app.get("/api/health")
async def health_check():
    db_status = "unknown"
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {e}"
    return {
        "status":     "healthy",
        "service":    "English Adventure API v2",
        "database":   db_status,
        "groq_key":   "Set" if os.getenv("GROQ_API_KEY") else "Not Set",
        "youtube_key":"Set" if os.getenv("YOUTUBE_API_KEY") else "Not Set",
        "env":        os.getenv("VERCEL_ENV", "local"),
    }


# ═════════════════════════════════════════════════════════════════════════════
# AUTH
# ═════════════════════════════════════════════════════════════════════════════
@app.post("/api/auth/register", response_model=TokenResponse)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == body.username).first():
        raise HTTPException(400, "Username already taken")
    user = User(
        username        = body.username,
        full_name       = body.full_name,
        email           = body.email,
        hashed_password = auth_service.hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenResponse(
        access_token = auth_service.create_token(user.id),
        user_id      = user.id,
        username     = user.username,
        level        = user.level,
        xp           = user.xp,
    )


@app.post("/api/auth/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == body.username).first()
    if not user or not auth_service.verify_password(body.password, user.hashed_password):
        raise HTTPException(401, "Invalid username or password")
    return TokenResponse(
        access_token = auth_service.create_token(user.id),
        user_id      = user.id,
        username     = user.username,
        level        = user.level,
        xp           = user.xp,
    )


@app.get("/api/auth/me")
def me(current_user: User = Depends(auth_service.get_current_user)):
    return {
        "id":        current_user.id,
        "username":  current_user.username,
        "full_name": current_user.full_name,
        "level":     current_user.level,
        "xp":        current_user.xp,
        "coins":     current_user.coins,
    }


# ═════════════════════════════════════════════════════════════════════════════
# VIDEOS
# ═════════════════════════════════════════════════════════════════════════════
@app.get("/api/videos", response_model=list[VideoOut])
def list_videos(
    topic:      Optional[str] = Query(None),
    difficulty: Optional[int] = Query(None),
    db:         Session       = Depends(get_db),
):
    q = db.query(Video)
    if topic:
        q = q.filter(Video.topic.ilike(f"%{topic}%"))
    if difficulty:
        q = q.filter(Video.difficulty == difficulty)
    return q.order_by(Video.order_index).all()


@app.get("/api/videos/{video_id}", response_model=VideoOut)
def get_video(video_id: int, db: Session = Depends(get_db)):
    v = db.query(Video).filter(Video.id == video_id).first()
    if not v:
        raise HTTPException(404, "Video not found")
    return v


@app.post("/api/videos/sync")
async def sync_videos(
    channel_id:  Optional[str] = Query(None),
    max_results: int            = Query(30),
    db:          Session        = Depends(get_db),
):
    """Sync videos from YouTube channel to DB."""
    result = await yt_svc.sync_channel_to_db(db, channel_id, max_results)
    return result


# ── Video Progress ─────────────────────────────────────────────────────────────
@app.get("/api/videos/{video_id}/progress")
async def get_video_progress(
    video_id: int,
    user_id:  int,
    db:       Session = Depends(get_db),
):
    # Try Redis cache first
    cached = await redis_get_progress(user_id, video_id)
    if cached is not None:
        return {"video_id": video_id, "watch_pct": cached, "source": "cache"}

    vp = (
        db.query(VideoProgress)
        .filter(VideoProgress.user_id == user_id, VideoProgress.video_id == video_id)
        .first()
    )
    return vp or {"video_id": video_id, "watch_pct": 0, "last_position": 0, "completed": False}


@app.post("/api/videos/{video_id}/progress")
async def update_video_progress(
    video_id: int,
    body:     ProgressUpdateRequest,
    db:       Session = Depends(get_db),
):
    """Save/update video watch position and grant XP on first completion."""
    vp = (
        db.query(VideoProgress)
        .filter(VideoProgress.user_id == body.user_id, VideoProgress.video_id == video_id)
        .first()
    )
    already_completed = vp.completed if vp else False
    xp_gain = 0

    if not vp:
        vp = VideoProgress(user_id=body.user_id, video_id=video_id)
        db.add(vp)

    # Mark complete when ≥ 85% watched
    if body.watch_pct >= 85 and not already_completed:
        xp_gain = 20
        vp.watch_pct = body.watch_pct
        vp.last_position = body.last_position
        vp.completed = True
        vp.xp_earned = xp_gain
        user = db.query(User).filter(User.id == body.user_id).first()
        if user:
            # Dynamic mission generation
            try:
                gen = get_mission_gen()
                engine = get_adaptive_engine()
                
                # Determine current level
                user_level = user.level
                # Logic for mission can be added here if needed
            except Exception:
                pass
            user.xp    += xp_gain
            user.coins += 10
            user.level  = (user.xp // 1000) + 1
    else:
        vp.watch_pct     = body.watch_pct
        vp.last_position = body.last_position

    db.commit()
    # Update Redis cache
    await redis_set_progress(body.user_id, video_id, body.watch_pct)

    return {"status": "saved", "xp_gained": xp_gain, "completed": vp.completed}


# ═════════════════════════════════════════════════════════════════════════════
# QUIZZES
# ═════════════════════════════════════════════════════════════════════════════
@app.get("/api/quiz/{video_id}", response_model=QuizOut)
def get_quiz(video_id: int, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.video_id == video_id).first()
    if not quiz:
        raise HTTPException(404, "No quiz found for this video")
    return quiz


@app.post("/api/quiz/{quiz_id}/submit", response_model=QuizResultOut)
def submit_quiz(quiz_id: int, body: QuizSubmitRequest, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(404, "Quiz not found")

    questions   = quiz.questions
    calc        = get_quiz_svc().calculate_score(questions, body.answers)
    passed      = calc["score"] >= (quiz.pass_score or 70)

    result = get_quiz_svc().save_result(
        db, body.user_id, quiz_id,
        calc["score"], body.answers, passed, calc["xp"]
    )
    new_badges = get_quiz_svc().check_achievements(db, body.user_id)

    return QuizResultOut(
        score      = result.score,
        passed     = result.passed,
        correct    = calc["correct"],
        total      = calc["total"],
        xp_earned  = result.xp_earned,
        new_badges = new_badges,
        details    = calc["details"],
    )


@app.get("/api/quiz/{quiz_id}/results/{user_id}")
def quiz_results(quiz_id: int, user_id: int, db: Session = Depends(get_db)):
    results = (
        db.query(QuizResult)
        .filter(QuizResult.quiz_id == quiz_id, QuizResult.user_id == user_id)
        .order_by(QuizResult.completed_at.desc())
        .all()
    )
    return results


# ═════════════════════════════════════════════════════════════════════════════
# PROGRESS / DASHBOARD
# ═════════════════════════════════════════════════════════════════════════════
@app.get("/api/progress/{user_id}", response_model=DashboardOut)
def get_dashboard(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    videos_done = (
        db.query(VideoProgress)
        .filter(VideoProgress.user_id == user_id, VideoProgress.completed == True)
        .count()
    )
    quizzes_done = (
        db.query(QuizResult)
        .filter(QuizResult.user_id == user_id, QuizResult.passed == True)
        .count()
    )
    from sqlalchemy.sql import func
    minutes = (
        db.query(func.sum(SpeakingSession.duration_sec))
        .filter(SpeakingSession.user_id == user_id)
        .scalar() or 0
    ) // 60

    badges = get_quiz_svc().check_achievements(db, user_id)

    return DashboardOut(
        user_id          = user.id,
        username         = user.username,
        full_name        = user.full_name,
        avatar_url       = user.avatar_url,
        level            = user.level,
        xp               = user.xp,
        coins            = user.coins,
        videos_completed = videos_done,
        quizzes_passed   = quizzes_done,
        speaking_minutes = minutes,
        badges           = [{"code": b.code, "name": b.name, "icon_url": b.icon_url} for b in badges] if isinstance(badges, list) else [],
    )


@app.get("/api/leaderboard")
def leaderboard(limit: int = Query(10, le=50), db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.xp.desc()).limit(limit).all()
    return [
        {"rank": i + 1, "username": u.username, "level": u.level, "xp": u.xp}
        for i, u in enumerate(users)
    ]


@app.get("/api/achievements/{user_id}")
def get_achievements(user_id: int, db: Session = Depends(get_db)):
    badges = (
        db.query(Achievement)
        .join(UserAchievement, UserAchievement.achievement_id == Achievement.id)
        .filter(UserAchievement.user_id == user_id)
        .all()
    )
    return badges


# ═════════════════════════════════════════════════════════════════════════════
# AI SPEAKING CLUB
# ═════════════════════════════════════════════════════════════════════════════
@app.get("/api/speaking/topics")
def speaking_topics():
    try:
        from speaking_service import SPEAKING_TOPICS
        return SPEAKING_TOPICS
    except ImportError:
        return []

@app.get("/api/speaking/sessions/{user_id}", response_model=list[SpeakingSessionOut])
def speaking_sessions(user_id: int, db: Session = Depends(get_db)):
    return (
        db.query(SpeakingSession)
        .filter(SpeakingSession.user_id == user_id)
        .order_by(SpeakingSession.created_at.desc())
        .limit(20)
        .all()
    )


@app.websocket("/ws/speaking")
async def speaking_ws(
    websocket: WebSocket,
    user_id:   int    = Query(...),
    topic_id:  str    = Query("free"),
    db:        Session = Depends(get_db),
):
    try:
        from speaking_service import speaking_partner_ws
        await speaking_partner_ws(websocket, user_id, topic_id, db)
    except ImportError as e:
        await websocket.accept()
        await websocket.send_json({"type": "error", "message": f"Speaking service import hatosi: {e}"})
        await websocket.close()


@app.get("/api/ping")
def ping():
    return {"status": "pong", "info": "API is alive"}

@app.post("/api/speaking/chat")
async def speaking_chat_http(
    body: dict,
    db:   Session = Depends(get_db),
):
    """
    Consolidated HTTP-based chat turn for Vercel compatibility.
    """
    try:
        from groq import Groq
        api_key = os.getenv("GROQ_API_KEY", "")
        if not api_key:
            return {"user_transcript": body.get("text"), "ai_text": "Xatolik: GROQ_API_KEY o'rnatilmagan.", "scores": {}}

        client = Groq(api_key=api_key)
        
        topic_id = body.get("topic_id", "free")
        text     = body.get("text", "").strip()
        history  = body.get("history", [])

        if not text:
            raise HTTPException(400, "Text is required")

        # Core AI Prompting logic (copied from speaking_service for isolation)
        system_prompt = f"You are Alex, a friendly English tutor for children. Topic ID: {topic_id}. Reply in JSON format: {{'reply': '...', 'scores': {{'fluency': 8, ...}}}}"
        
        import asyncio
        loop = asyncio.get_event_loop()
        chat_completion = await loop.run_in_executor(None, lambda: client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                *history,
                {"role": "user", "content": text}
            ],
            response_format={"type": "json_object"}
        ))
        
        import json
        res_data = json.loads(chat_completion.choices[0].message.content)
        
        return {
            "user_transcript": text,
            "ai_text":         res_data.get("reply", ""),
            "scores":          res_data.get("scores", {"fluency": 7, "grammar": 7, "vocab": 7})
        }
    except Exception as e:
        import traceback
        err_info = f"{str(e)}\n{traceback.format_exc()}"
        print(err_info)
        return {"error": "Internal Server Error", "detail": err_info}


@app.post("/api/speaking/voice")
async def speaking_voice_http(
    file:     UploadFile = File(...),
    user_id:  int        = Query(...),
    topic_id: str        = Query("free"),
    history:  str        = Query("[]"), # JSON string
    db:       Session    = Depends(get_db),
):
    """
    Consolidated HTTP-based voice turn for Vercel.
    """
    temp_path = f"/tmp/voice_{user_id}_{int(time.time())}.webm"
    try:
        with open(temp_path, "wb") as buf:
            shutil.copyfileobj(file.file, buf)

        from groq import Groq
        api_key = os.getenv("GROQ_API_KEY", "")
        if not api_key:
            return {"error": "GROQ_API_KEY Not Set"}

        client = Groq(api_key=api_key)
            
        # 1. Transcribe
        with open(temp_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-large-v3",
                file=audio_file,
                response_format="text"
            )
        user_text = transcript.strip()
        
        # 2. Get AI Reply
        import json
        hist_list = json.loads(history)
        
        system_prompt = f"You are Alex, a friendly English tutor for children. Topic ID: {topic_id}. Reply in JSON format: {{'reply': '...', 'scores': {{'fluency': 8, ...}}}}"
        
        import asyncio
        loop = asyncio.get_event_loop()
        chat_completion = await loop.run_in_executor(None, lambda: client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                *hist_list,
                {"role": "user", "content": user_text}
            ],
            response_format={"type": "json_object"}
        ))
        res_data = json.loads(chat_completion.choices[0].message.content)
        
        return {
            "user_transcript": user_text,
            "ai_text":         res_data.get("reply", ""),
            "scores":          res_data.get("scores", {"fluency": 7, "grammar": 7, "vocab": 7})
        }
    except Exception as e:
        import traceback
        err_info = f"{str(e)}\n{traceback.format_exc()}"
        return {"error": "Internal Server Error", "detail": err_info}
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


# ═════════════════════════════════════════════════════════════════════════════
# LEGACY – Speech analysis  (kept for backward-compat)
# ═════════════════════════════════════════════════════════════════════════════
@app.post("/api/v1/speech/analyze")
async def analyze_speech(
    file: UploadFile = File(...),
    target_text: str = "",
    db: Session = Depends(get_db),
):
    temp_path = f"/tmp/temp_{file.filename}"
    with open(temp_path, "wb") as buf:
        shutil.copyfileobj(file.file, buf)
    try:
        analyzer = get_voice_analyzer()
        result = await analyzer.analyze_pronunciation(temp_path, target_text)
        return result
    except Exception as e:
        import traceback
        err_msg = f"Backend xatosi: {str(e)}\n{traceback.format_exc()}"
        print(err_msg)
        raise HTTPException(500, err_msg)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
