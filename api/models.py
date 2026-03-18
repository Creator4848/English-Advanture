from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    xp = Column(Integer, default=0)
    gravity_coins = Column(Integer, default=0)
    level = Column(Integer, default=1)
    preferences = Column(JSON, default={}) 
    created_at = Column(DateTime, server_default=func.now())
    
    progress = relationship("Progress", back_populates="user")

class Mission(Base):
    __tablename__ = 'missions'
    id = Column(Integer, primary_key=True)
    title = Column(String)
    content = Column(JSON) # Lesson data: sentences, words, images
    difficulty_rank = Column(Integer) # 1 to 10
    category = Column(String) # Grammar, Vocabulary, Speaking
    
    progress = relationship("Progress", back_populates="mission")

class Progress(Base):
    __tablename__ = 'progress'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    mission_id = Column(Integer, ForeignKey('missions.id'))
    score = Column(Float)
    mistakes = Column(JSON) # List of specific errors found by AI
    completed_at = Column(DateTime, server_default=func.now())
    
    user = relationship("User", back_populates="progress")
    mission = relationship("Mission", back_populates="progress")

class Achievement(Base):
    __tablename__ = 'achievements'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    icon_url = Column(String)
    criteria = Column(JSON) # XP > 1000 etc.

class AILog(Base):
    __tablename__ = 'ai_logs'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    input_type = Column(String) # 'speech' or 'text'
    raw_input = Column(String)
    ai_feedback = Column(JSON) # Detailed AI analysis
    created_at = Column(DateTime, server_default=func.now())
