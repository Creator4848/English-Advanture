import os
import redis.asyncio as aioredis
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# ── PostgreSQL (falls back to SQLite for local dev) ──────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////tmp/english_adventure.db")

# Heroku / Supabase give "postgres://" which SQLAlchemy 1.4+ requires as
# "postgresql://"
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine_kwargs: dict = {}
if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # Add timeout for PostgreSQL
    engine_kwargs["connect_args"] = {"connect_timeout": 5}

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Redis (optional – gracefully disabled if not configured) ─────────────────
REDIS_URL = os.getenv("REDIS_URL", "")

_redis_client = None


async def get_redis() -> aioredis.Redis | None:
    """Return a Redis client, or None if REDIS_URL is not set."""
    global _redis_client
    if not REDIS_URL:
        return None
    if _redis_client is None:
        _redis_client = await aioredis.from_url(
            REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=2,
        )
    return _redis_client


async def redis_incr_xp(user_id: int, amount: int) -> int | None:
    """Increment real-time XP in Redis. Returns new total or None."""
    r = await get_redis()
    if r is None:
        return None
    key = f"xp:{user_id}"
    try:
        return await r.incrby(key, amount)
    except Exception:
        return None


async def redis_set_progress(user_id: int, video_id: int, pct: int) -> None:
    """Cache video watch percentage for real-time display."""
    r = await get_redis()
    if r is None:
        return
    key = f"progress:{user_id}:{video_id}"
    try:
        await r.setex(key, 3600, str(pct))   # TTL 1 hour
    except Exception:
        pass


async def redis_get_progress(user_id: int, video_id: int) -> int | None:
    r = await get_redis()
    if r is None:
        return None
    key = f"progress:{user_id}:{video_id}"
    try:
        val = await r.get(key)
        return int(val) if val else None
    except Exception:
        return None
