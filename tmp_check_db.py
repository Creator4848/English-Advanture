from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

load_dotenv(".env.local")

url = os.getenv("DATABASE_URL")
if not url:
    print("No DB URL")
    exit()

engine = create_engine(url)
with engine.connect() as conn:
    res = conn.execute("SELECT count(*) FROM videos").scalar()
    print("Total videos in DB:", res)
