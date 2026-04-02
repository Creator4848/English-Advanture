import os
import sys

# Path hack for Vercel to find local modules in the 'api' directory
current_file_dir = os.path.dirname(os.path.abspath(__file__))
if current_file_dir not in sys.path:
    sys.path.append(current_file_dir)

print(f"DEBUG: Starting English Adventure API. CWD: {os.getcwd()}, FILE: {__file__}, PATH: {sys.path}")

import shutil
from typing import Optional

from fastapi import (
    FastAPI, Depends, HTTPException, UploadFile, File,
    Query, WebSocket, Request
)
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse
import traceback
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import text
import json
import time
from groq import Groq

from database import get_db, engine, redis_set_progress, redis_get_progress
import models
from models import (
    User, Video, Quiz, QuizQuestion, QuizResult,
    VideoProgress, SpeakingSession, Achievement, UserAchievement,
)
from schemas import (
    RegisterRequest, LoginRequest, TokenResponse,
    VideoOut, VideoCreate, VideoUpdate,
    ProgressUpdateRequest, ProgressOut,
    QuizOut, QuizSubmitRequest, QuizResultOut,
    SpeakingSessionOut, DashboardOut
)
import auth_service
from demo_seed import seed_demo_data

SPEAKING_TOPICS = [
    {"id": "animals",    "label": "Animals 🐾",  "prompt": "Talk about favorite animals"},
    {"id": "colors",     "label": "Colors 🎨",   "prompt": "Describe things by their color"},
    {"id": "family",     "label": "Family 👨‍👩‍👧",  "prompt": "Talk about family members"},
    {"id": "food",       "label": "Food 🍎",     "prompt": "Talk about foods you like or dislike"},
    {"id": "numbers",    "label": "Numbers 🔢",  "prompt": "Count and describe quantities"},
    {"id": "weather",    "label": "Weather ☀️",  "prompt": "Describe today's weather"},
    {"id": "school",     "label": "School 🏫",   "prompt": "Talk about school activities"},
    {"id": "free",       "label": "Free Talk 💬", "prompt": "Talk about anything you like"},
]

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

# ── Error Handling ────────────────────────────────────────────────────────────

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    print(f"HTTP_EXCEPTION: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "status": "error"}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    err_msg = f"CRITICAL_BACKEND_ERROR: {str(exc)}\n{traceback.format_exc()}"
    print(err_msg)
    return JSONResponse(
        status_code=500,
        content={"detail": err_msg, "status": "error"}
    )

# ── DB init (Moved to startup for stability) ──────────────────────────────────
@app.on_event("startup")
async def startup_event():
    print("DEBUG: Startup event triggered")
    try:
        print(f"DEBUG: Connecting to DB: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else DATABASE_URL}")
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ DB connection success")
        models.Base.metadata.create_all(bind=engine)
        print("✅ Database tables created")
    except Exception as e:
        print(f"⚠️  DB startup error: {e}")
        traceback.print_exc()

    try:
        from database import SessionLocal
        with SessionLocal() as db:
            seed_demo_data(db)
            print("✅ Demo data seeded")
    except Exception as e:
        print(f"⚠️  DB seeding error: {e}")
        traceback.print_exc()

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

@app.get("/api/debug")
async def debug_info():
    import sys
    return {
        "sys.path": sys.path,
        "cwd":      os.getcwd(),
        "env":      {k: v for k, v in os.environ.items() if "KEY" not in k and "SECRET" not in k and "TOKEN" not in k},
        "python":   sys.version,
    }

@app.get("/api/test_db")
async def test_db(db: Session = Depends(get_db)):
    """Explicit DB test route."""
    try:
        result = db.execute(text("SELECT count(*) FROM videos")).scalar()
        return {"status": "success", "video_count": result}
    except Exception as e:
        return {"status": "error", "message": str(e), "trace": traceback.format_exc()}


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
    yt_svc = get_yt_svc()
    result = await yt_svc.sync_channel_to_db(db, channel_id, max_results)
    return result


@app.post("/api/videos", response_model=VideoOut)
def create_video(body: VideoCreate, db: Session = Depends(get_db)):
    try:
        video = Video(**body.dict())
        db.add(video)
        db.commit()
        db.refresh(video)
        return video
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Bu YouTube ID ga ega dars allaqachon mavjud!")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/videos/{video_id}", response_model=VideoOut)
def update_video(video_id: int, body: VideoUpdate, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(404, "Video not found")
    
    update_data = body.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(video, key, value)
    
    db.commit()
    db.refresh(video)
    return video


@app.delete("/api/videos/{video_id}")
def delete_video(video_id: int, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(404, "Video not found")
    
    db.delete(video)
    db.commit()
    return {"status": "deleted", "video_id": video_id}


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


@app.get("/api/ping_safe")
def ping_safe():
    """Dependency-free ping for environment verification."""
    return {"status": "ok", "message": "Python environment is healthy", "time": time.time()}

@app.get("/api/ping")
def ping():
    return {"status": "pong", "info": "API is alive"}

@app.post("/api/chat")
async def chat_handler(request: Request):
    """Advanced AI chat endpoint for Alex."""
    try:
        body = await request.json()
        api_key = os.getenv("GROQ_API_KEY", "")
        if not api_key:
            return {"error": "GROQ_API_KEY not set"}

        client = Groq(api_key=api_key)
        
        topic_id = body.get("topic_id", "free")
        text     = body.get("text", "").strip()
        history  = body.get("history", [])

        topic_obj = next((t for t in SPEAKING_TOPICS if t["id"] == topic_id), SPEAKING_TOPICS[-1])
        topic_label = topic_obj["label"]

        system_prompt = f"""
        You are Alex, a friendly English tutor for children. 
        Your goal is to have a simple and engaging conversation in English.
        Current Topic: {topic_label}.

        Rules:
        1. Keep sentences short and simple (suitable for kids).
        2. Be encouraging and use emojis.
        3. If the user doesn't speak English, kindly remind them to try English, but you can say a few words in Uzbek to help (e.g. "Iltimos, inglizcha gapiring!").
        4. If the topic is "Free Talk 💬", you can talk about anything the user wants.
        5. ALWAYS respond in JSON format with two keys: "reply" (your text response) and "scores" (an object with fluency, grammar, and vocab scores from 1-10).
        """
        
        # We use run_in_executor because Groq's current SDK is synchronous (as used here)
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
        
        res_data = json.loads(chat_completion.choices[0].message.content)
        return {
            "user_transcript": text,
            "ai_text":         res_data.get("reply", ""),
            "scores":          res_data.get("scores", {"fluency": 7, "grammar": 7, "vocab": 7})
        }
    except Exception as e:
        import traceback
        return {"error": "Internal Server Error", "detail": f"{str(e)}\n{traceback.format_exc()}"}


@app.post("/api/voice")
async def voice_handler(
    file:     UploadFile = File(...),
    user_id:  int        = Query(...),
    topic_id: str        = Query("free"),
    history:  str        = Query("[]"),
):
    """Advanced AI voice endpoint for Alex."""
    temp_path = f"/tmp/voice_{user_id}_{int(time.time())}.webm"
    try:
        with open(temp_path, "wb") as buf:
            shutil.copyfileobj(file.file, buf)

        api_key = os.getenv("GROQ_API_KEY", "")
        if not api_key:
            return {"error": "GROQ_API_KEY not set"}

        client = Groq(api_key=api_key)
        
        import asyncio
        loop = asyncio.get_event_loop()

        # 1. Transcribe (Sync)
        transcript = await loop.run_in_executor(None, lambda: client.audio.transcriptions.create(
            model="whisper-large-v3",
            file=open(temp_path, "rb"),
            response_format="text"
        ))
        user_text = transcript.strip()
        
        hist_list = json.loads(history)
        topic_obj = next((t for t in SPEAKING_TOPICS if t["id"] == topic_id), SPEAKING_TOPICS[-1])
        topic_label = topic_obj["label"]

        system_prompt = f"""
        You are Alex, a friendly English tutor for children. 
        Your goal is to have a simple and engaging conversation in English.
        Current Topic: {topic_label}.

        Rules:
        1. Keep sentences short and simple (suitable for kids).
        2. Be encouraging and use emojis.
        3. If the user doesn't speak English, kindly remind them to try English, but you can say a few words in Uzbek to help (e.g. "Iltimos, inglizcha gapiring!").
        4. If the topic is "Free Talk 💬", you can talk about anything the user wants.
        5. ALWAYS respond in JSON format with two keys: "reply" (your text response) and "scores" (an object with fluency, grammar, and vocab scores from 1-10).
        """
        
        # 2. Chat (Sync)
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
        return {"error": "Internal Server Error", "detail": f"{str(e)}\n{traceback.format_exc()}"}
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
