import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), 'api'))

from dotenv import load_dotenv
load_dotenv(".env.local")
load_dotenv(".env.production", override=False)

from sqlalchemy.orm import Session
from database import SessionLocal
from models import Video

def clean_duplicates():
    db: Session = SessionLocal()
    try:
        videos = db.query(Video).all()
        seen = {}
        duplicates = []
        for v in videos:
            if v.youtube_id in seen:
                duplicates.append(v)
            else:
                seen[v.youtube_id] = v
        
        print(f"Total videos: {len(videos)}, Duplicates to remove: {len(duplicates)}")
        for d in duplicates:
            print(f"Removing duplicate: {d.title} (ID: {d.id})")
            db.delete(d)
        db.commit()
        print("Cleanup completed.")
    except Exception as e:
        print("Error:", e)
    finally:
        db.close()

if __name__ == "__main__":
    clean_duplicates()
