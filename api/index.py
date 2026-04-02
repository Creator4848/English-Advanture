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
from speaking_service  import speaking_partner_ws, SPEAKING_TOPICS
from demo_seed         import seed_demo_data

# ── DB init ───────────────────────────────────────────────────────────────────
try:
    models.Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")
    # Auto-seed demo data on every cold start (idempotent)
    from database import SessionLocal
    _seed_db = SessionLocal()
    try:
        seed_demo_data(_seed_db)
        print("✅ Demo data seeded")
    finally:
        _seed_db.close()
except Exception as e:
    print(f"⚠️  DB init error: {e}")


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

# ── Service singletons ────────────────────────────────────────────────────────
voice_analyzer  = speech.VoiceAnalyzer()
adaptive_engine = adaptive.AdaptiveEngine()
mission_gen     = llm_service.MissionGenerator()
quiz_svc        = QuizService()
yt_svc          = YouTubeService()


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

    vp.watch_pct     = body.watch_pct
    vp.last_position = body.last_position

    # Mark complete when ≥ 85% watched
    if body.watch_pct >= 85 and not already_completed:
        vp.completed = True
        xp_gain      = 50
        vp.xp_earned = xp_gain
        user = db.query(User).filter(User.id == body.user_id).first()
        if user:
            user.xp    += xp_gain
            user.coins += 10
            user.level  = (user.xp // 1000) + 1

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
    calc        = quiz_svc.calculate_score(questions, body.answers)
    passed      = calc["score"] >= (quiz.pass_score or 70)

    result = quiz_svc.save_result(
        db, body.user_id, quiz_id,
        calc["score"], body.answers, passed, calc["xp"]
    )
    new_badges = quiz_svc.check_achievements(db, body.user_id)

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
        .filter(VideoProgress.user_id == user_id, VideoProgress.completed.is_(True))
        .count()
    )
    quizzes_passed = (
        db.query(QuizResult)
        .filter(QuizResult.user_id == user_id, QuizResult.passed.is_(True))
        .count()
    )
    speaking_seconds = (
        db.query(SpeakingSession)
        .filter(SpeakingSession.user_id == user_id)
        .with_entities(SpeakingSession.duration_sec)
        .all()
    )
    total_speaking_min = sum(r[0] or 0 for r in speaking_seconds) // 60

    badges = (
        db.query(Achievement)
        .join(UserAchievement, UserAchievement.achievement_id == Achievement.id)
        .filter(UserAchievement.user_id == user_id)
        .all()
    )

    return DashboardOut(
        user_id          = user.id,
        username         = user.username,
        full_name        = user.full_name,
        avatar_url       = user.avatar_url,
        level            = user.level,
        xp               = user.xp,
        coins            = user.coins,
        videos_completed = videos_done,
        quizzes_passed   = quizzes_passed,
        speaking_minutes = total_speaking_min,
        badges           = [{"code": b.code, "name": b.name, "icon_url": b.icon_url} for b in badges],
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
    return SPEAKING_TOPICS


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
    await speaking_partner_ws(websocket, user_id, topic_id, db)


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
        result = await voice_analyzer.analyze_pronunciation(temp_path, target_text)
        return result
    except Exception as e:
        raise HTTPException(500, str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
