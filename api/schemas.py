"""
schemas.py
Pydantic request / response schemas for English Adventure API.
"""
from __future__ import annotations
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, Any
import re


# ── Auth ─────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    username:  str
    full_name: Optional[str] = None
    email:     Optional[str] = None
    password:  str

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user_id:      int
    username:     str
    level:        int
    xp:           int


# ── Videos ───────────────────────────────────────────────────────────────────

class VideoOut(BaseModel):
    id:               int
    youtube_id:       str
    title:            str
    description:      Optional[str]
    thumbnail_url:    Optional[str]
    duration_seconds: Optional[int]
    difficulty:       int
    topic:            Optional[str]
    order_index:      Optional[int]

    class Config:
        from_attributes = True

class VideoCreate(BaseModel):
    youtube_id:       str
    title:            str
    description:      Optional[str] = None
    thumbnail_url:    Optional[str] = None
    duration_seconds: Optional[int] = 0
    difficulty:       int           = 1
    topic:            Optional[str] = None
    order_index:      Optional[int] = 0

class VideoUpdate(BaseModel):
    youtube_id:       Optional[str] = None
    title:            Optional[str] = None
    description:      Optional[str] = None
    thumbnail_url:    Optional[str] = None
    duration_seconds: Optional[int] = None
    difficulty:       Optional[int] = None
    topic:            Optional[str] = None
    order_index:      Optional[int] = None


# ── Video Progress ────────────────────────────────────────────────────────────

class ProgressUpdateRequest(BaseModel):
    user_id:       int
    watch_pct:     int      # 0–100
    last_position: int      # seconds

class ProgressOut(BaseModel):
    video_id:      int
    watch_pct:     int
    last_position: int
    completed:     bool
    xp_earned:     int

    class Config:
        from_attributes = True


# ── Quiz ─────────────────────────────────────────────────────────────────────

class QuizOptionOut(BaseModel):
    id:        str
    text:      str
    image_url: Optional[str] = None

class QuizQuestionOut(BaseModel):
    id:                 int
    question:           str
    question_image_url: Optional[str]
    options:            list[QuizOptionOut]
    order_index:        Optional[int]

    class Config:
        from_attributes = True

class QuizOut(BaseModel):
    id:        int
    video_id:  int
    title:     Optional[str]
    quiz_type: Optional[str]
    questions: list[QuizQuestionOut]

    class Config:
        from_attributes = True

class QuizSubmitRequest(BaseModel):
    user_id: int
    answers: dict[str, str]   # {question_id: option_id}

class QuizResultOut(BaseModel):
    score:       int
    passed:      bool
    correct:     int
    total:       int
    xp_earned:   int
    new_badges:  list[str]
    details:     list[dict]


# ── Speaking ──────────────────────────────────────────────────────────────────

class SpeakingSessionOut(BaseModel):
    id:            int
    topic:         str
    fluency_score: Optional[int]
    grammar_score: Optional[int]
    vocab_score:   Optional[int]
    ai_feedback:   Optional[str]
    duration_sec:  Optional[int]
    created_at:    Any

    class Config:
        from_attributes = True


# ── Dashboard ─────────────────────────────────────────────────────────────────

class DashboardOut(BaseModel):
    user_id:          int
    username:         str
    full_name:        Optional[str]
    avatar_url:       Optional[str]
    level:            int
    xp:               int
    coins:            int
    videos_completed: int
    quizzes_passed:   int
    speaking_minutes: int
    badges:           list[dict]
