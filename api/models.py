from sqlalchemy import (
    Column, Integer, String, Float, ForeignKey, JSON,
    DateTime, Boolean, Text, SmallInteger, UniqueConstraint
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

Base = declarative_base()


# ─────────────────────────────────────────────
# 1. USERS
# ─────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True)
    username        = Column(String(100), unique=True, index=True, nullable=False)
    full_name       = Column(String(200))
    email           = Column(String(200), unique=True)
    hashed_password = Column(Text, nullable=False)
    avatar_url      = Column(Text)
    xp              = Column(Integer, default=0)
    coins           = Column(Integer, default=0)
    level           = Column(Integer, default=1)
    # Legacy field kept for compatibility
    gravity_coins   = Column(Integer, default=0)
    preferences     = Column(JSON, default={})
    created_at      = Column(DateTime, server_default=func.now())

    # Relationships
    video_progress   = relationship("VideoProgress", back_populates="user", cascade="all, delete-orphan")
    quiz_results     = relationship("QuizResult", back_populates="user", cascade="all, delete-orphan")
    speaking_sessions = relationship("SpeakingSession", back_populates="user", cascade="all, delete-orphan")
    ai_logs          = relationship("AILog", back_populates="user", cascade="all, delete-orphan")
    user_achievements = relationship("UserAchievement", back_populates="user", cascade="all, delete-orphan")


# ─────────────────────────────────────────────
# 2. VIDEOS (YouTube Lessons)
# ─────────────────────────────────────────────
class Video(Base):
    __tablename__ = "videos"

    id               = Column(Integer, primary_key=True)
    youtube_id       = Column(String(20), unique=True, nullable=False)  # e.g. "dQw4w9WgXcQ"
    title            = Column(String(300), nullable=False)
    description      = Column(Text)
    thumbnail_url    = Column(Text)
    duration_seconds = Column(Integer)
    difficulty       = Column(SmallInteger, default=1)  # 1=Beginner 2=Elementary 3=Pre-Intermediate
    topic            = Column(String(100))              # "Colors", "Animals", "Numbers"
    order_index      = Column(Integer)
    published_at     = Column(DateTime)
    created_at       = Column(DateTime, server_default=func.now())

    quizzes        = relationship("Quiz", back_populates="video", cascade="all, delete-orphan")
    video_progress = relationship("VideoProgress", back_populates="video", cascade="all, delete-orphan")


# ─────────────────────────────────────────────
# 3. QUIZZES
# ─────────────────────────────────────────────
class Quiz(Base):
    __tablename__ = "quizzes"

    id         = Column(Integer, primary_key=True)
    video_id   = Column(Integer, ForeignKey("videos.id", ondelete="CASCADE"))
    title      = Column(String(200))
    quiz_type  = Column(String(50))   # 'drag_drop' | 'image_choice' | 'fill_blank' | 'listening'
    pass_score = Column(SmallInteger, default=70)
    created_at = Column(DateTime, server_default=func.now())

    video     = relationship("Video", back_populates="quizzes")
    questions = relationship("QuizQuestion", back_populates="quiz", cascade="all, delete-orphan")
    results   = relationship("QuizResult", back_populates="quiz", cascade="all, delete-orphan")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id                 = Column(Integer, primary_key=True)
    quiz_id            = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"))
    question           = Column(Text, nullable=False)
    question_image_url = Column(Text)
    # JSON: [{"id":"a","text":"Cat","image_url":"..."}]
    options            = Column(JSON, nullable=False)
    correct_ans        = Column(String(10), nullable=False)
    points             = Column(SmallInteger, default=10)
    order_index        = Column(Integer)

    quiz = relationship("Quiz", back_populates="questions")


# ─────────────────────────────────────────────
# 4. VIDEO PROGRESS
# ─────────────────────────────────────────────
class VideoProgress(Base):
    __tablename__ = "video_progress"
    __table_args__ = (UniqueConstraint("user_id", "video_id"),)

    id            = Column(Integer, primary_key=True)
    user_id       = Column(Integer, ForeignKey("users.id"))
    video_id      = Column(Integer, ForeignKey("videos.id"))
    watch_pct     = Column(SmallInteger, default=0)    # 0–100 %
    last_position = Column(Integer, default=0)          # seconds
    completed     = Column(Boolean, default=False)
    xp_earned     = Column(Integer, default=0)
    updated_at    = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user  = relationship("User", back_populates="video_progress")
    video = relationship("Video", back_populates="video_progress")


# ─────────────────────────────────────────────
# 5. QUIZ RESULTS
# ─────────────────────────────────────────────
class QuizResult(Base):
    __tablename__ = "quiz_results"

    id           = Column(Integer, primary_key=True)
    user_id      = Column(Integer, ForeignKey("users.id"))
    quiz_id      = Column(Integer, ForeignKey("quizzes.id"))
    score        = Column(SmallInteger)      # 0–100
    answers      = Column(JSON)              # {"q_id": "user_answer"}
    passed       = Column(Boolean)
    xp_earned    = Column(Integer, default=0)
    attempt_no   = Column(SmallInteger, default=1)
    completed_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="quiz_results")
    quiz = relationship("Quiz", back_populates="results")


# ─────────────────────────────────────────────
# 6. AI SPEAKING SESSIONS
# ─────────────────────────────────────────────
class SpeakingSession(Base):
    __tablename__ = "speaking_sessions"

    id            = Column(Integer, primary_key=True)
    user_id       = Column(Integer, ForeignKey("users.id"))
    topic         = Column(String(200))
    # [{role: "user"|"assistant", content: "...", timestamp: "..."}]
    transcript    = Column(JSON, default=[])
    fluency_score = Column(SmallInteger)
    grammar_score = Column(SmallInteger)
    vocab_score   = Column(SmallInteger)
    ai_feedback   = Column(Text)
    duration_sec  = Column(Integer)
    created_at    = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="speaking_sessions")


# ─────────────────────────────────────────────
# 7. ACHIEVEMENTS
# ─────────────────────────────────────────────
class Achievement(Base):
    __tablename__ = "achievements"

    id          = Column(Integer, primary_key=True)
    code        = Column(String(50), unique=True)
    name        = Column(String(100))
    description = Column(Text)
    icon_url    = Column(Text)
    # {"type": "videos_completed", "value": 5}
    criteria    = Column(JSON)

    user_achievements = relationship("UserAchievement", back_populates="achievement")


class UserAchievement(Base):
    __tablename__ = "user_achievements"

    user_id        = Column(Integer, ForeignKey("users.id"), primary_key=True)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), primary_key=True)
    earned_at      = Column(DateTime, server_default=func.now())

    user        = relationship("User", back_populates="user_achievements")
    achievement = relationship("Achievement", back_populates="user_achievements")


# ─────────────────────────────────────────────
# 8. AI LOGS (legacy + new)
# ─────────────────────────────────────────────
class AILog(Base):
    __tablename__ = "ai_logs"

    id          = Column(Integer, primary_key=True)
    user_id     = Column(Integer, ForeignKey("users.id"))
    input_type  = Column(String)    # 'speech' | 'text'
    raw_input   = Column(String)
    ai_feedback = Column(JSON)
    created_at  = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="ai_logs")


# ─────────────────────────────────────────────
# 9. LEGACY – Mission (kept for backward-compat)
# ─────────────────────────────────────────────
class Mission(Base):
    __tablename__ = "missions"

    id              = Column(Integer, primary_key=True)
    title           = Column(String)
    content         = Column(JSON)
    difficulty_rank = Column(Integer)
    category        = Column(String)

# ─────────────────────────────────────────────
# 10. TEACHERS
# ─────────────────────────────────────────────
class Teacher(Base):
    __tablename__ = "teachers"

    id           = Column(Integer, primary_key=True)
    full_name    = Column(String(200), nullable=False)
    role         = Column(String(100), default="O'qituvchi")
    experience   = Column(String(100))
    rating       = Column(Float, default=5.0)
    image_url    = Column(Text)
    avatar_color = Column(String(100))
    bio          = Column(Text)
    created_at   = Column(DateTime, server_default=func.now())
