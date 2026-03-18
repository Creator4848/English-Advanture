from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
import shutil
from database import get_db, engine
import models, speech, adaptive, llm_service

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="English Adventure: Gravity Zero API")

@app.get("/api/health")
async function health_check():
    return {"status": "healthy", "service": "FastAPI"}


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

voice_analyzer = speech.VoiceAnalyzer()
adaptive_engine = adaptive.AdaptiveEngine()
mission_generator = llm_service.MissionGenerator()

@app.get("/")
async def root():
    return {"message": "Welcome to English Adventure: Gravity Zero API", "status": "online"}

@app.post("/api/v1/speech/analyze")
async def analyze_speech(file: UploadFile = File(...), target_text: str = "", db: Session = Depends(get_db)):
    # Save temporary file in /tmp for Vercel/Serverless compatibility
    temp_path = os.path.join("/tmp", f"temp_{file.filename}")
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        result = await voice_analyzer.analyze_pronunciation(temp_path, target_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.get("/api/v1/missions/next")
async def get_next_mission(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get recent performance
    recent_progress = db.query(models.Progress).filter(models.Progress.user_id == user_id).order_by(models.Progress.completed_at.desc()).limit(5).all()
    scores = [p.score for p in recent_progress]
    
    next_diff = adaptive_engine.calculate_next_difficulty(user.level, scores)
    
    # Try to find existing mission
    all_missions = db.query(models.Mission).all()
    next_mission_obj = adaptive_engine.select_next_mission(next_diff, all_missions)
    
    # If no mission found or we want something fresh, generate one
    if not next_mission_obj:
        generated = await mission_generator.generate_mission(next_diff, "General", user.preferences)
        # Save to DB for future use (optional, but good for persistence)
        new_mission = models.Mission(
            title=generated["title"],
            content=generated["content"],
            difficulty_rank=int(next_diff),
            category="AI-Generated"
        )
        db.add(new_mission)
        db.commit()
        db.refresh(new_mission)
        next_mission_obj = new_mission
    
    return {"next_difficulty": next_diff, "mission": next_mission_obj}

@app.post("/api/v1/progress/submit")
async def submit_progress(user_id: int, mission_id: int, score: float, mistakes: list = None, db: Session = Depends(get_db)):
    # 1. Record progress
    progress = models.Progress(
        user_id=user_id,
        mission_id=mission_id,
        score=score,
        mistakes=mistakes or []
    )
    db.add(progress)
    
    # 2. Update user stats
    user = db.query(models.User).filter(models.User.id == user_id).first()
    xp_gain = int(score * 100)
    coin_gain = int(score * 50)
    
    user.xp += xp_gain
    user.gravity_coins += coin_gain
    
    # Simple leveling logic
    new_level = (user.xp // 1000) + 1
    if new_level > user.level:
        user.level = new_level
        
    db.commit()
    return {
        "status": "success",
        "xp_gain": xp_gain,
        "coin_gain": coin_gain,
        "new_level": user.level,
        "leveled_up": new_level > user.level
    }

@app.get("/api/v1/achievements")
async def get_achievements(user_id: int, db: Session = Depends(get_db)):
    # Simple logic to check if user earned any new badges
    user = db.query(models.User).filter(models.User.id == user_id).first()
    all_badges = db.query(models.Achievement).all()
    # In a real app, we'd check criteria
    return all_badges
