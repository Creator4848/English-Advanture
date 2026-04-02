"""
youtube_service.py
YouTube Data API v3 integration for English Adventure.
Fetches video metadata from a YouTube channel or playlist and syncs to DB.
"""
import os
import httpx
from typing import Optional
from sqlalchemy.orm import Session
from models import Video

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")
YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"
DEFAULT_CHANNEL_ID = os.getenv("YOUTUBE_CHANNEL_ID", "")   # Set in .env


class YouTubeService:
    def __init__(self):
        self.api_key = YOUTUBE_API_KEY
        self.base_url = YOUTUBE_API_BASE

    # ── Helpers ────────────────────────────────────────────────────────────

    async def _get(self, endpoint: str, params: dict) -> dict:
        params["key"] = self.api_key
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(f"{self.base_url}/{endpoint}", params=params)
            resp.raise_for_status()
            return resp.json()

    # ── Public API ─────────────────────────────────────────────────────────

    async def search_videos(
        self,
        query: str,
        channel_id: str | None = None,
        max_results: int = 20,
    ) -> list[dict]:
        """Search YouTube for English learning videos."""
        params = {
            "part": "snippet",
            "type": "video",
            "q": query,
            "maxResults": max_results,
            "relevanceLanguage": "en",
            "safeSearch": "strict",
            "videoDuration": "short",          # under 4 min – suitable for kids
        }
        if channel_id:
            params["channelId"] = channel_id

        data = await self._get("search", params)
        return data.get("items", [])

    async def get_video_details(self, video_id: str) -> dict | None:
        """Fetch full metadata for a single YouTube video."""
        params = {"part": "snippet,contentDetails,statistics", "id": video_id}
        data = await self._get("videos", params)
        items = data.get("items", [])
        return items[0] if items else None

    async def get_channel_videos(
        self, channel_id: str | None = None, max_results: int = 50
    ) -> list[dict]:
        """Fetch recent videos from a channel."""
        ch = channel_id or DEFAULT_CHANNEL_ID
        params = {
            "part": "snippet",
            "channelId": ch,
            "order": "date",
            "maxResults": max_results,
            "type": "video",
        }
        data = await self._get("search", params)
        return data.get("items", [])

    # ── DB Sync ────────────────────────────────────────────────────────────

    @staticmethod
    def _parse_duration(iso_duration: str) -> int:
        """Convert ISO 8601 duration (PT4M30S) → seconds."""
        import re
        m = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", iso_duration or "")
        if not m:
            return 0
        h, mn, s = (int(x or 0) for x in m.groups())
        return h * 3600 + mn * 60 + s

    @staticmethod
    def _infer_difficulty(title: str, description: str) -> int:
        """Simple heuristic difficulty scoring."""
        text = (title + " " + description).lower()
        if any(w in text for w in ["advanced", "intermediate", "grammar", "tense"]):
            return 3
        if any(w in text for w in ["elementary", "basic", "simple"]):
            return 2
        return 1   # beginner / kids

    @staticmethod
    def _infer_topic(title: str) -> str:
        topics_map = {
            "color": "Colors", "colour": "Colors",
            "animal": "Animals", "farm": "Animals",
            "number": "Numbers", "count": "Numbers",
            "alphabet": "Alphabet", "abc": "Alphabet",
            "body": "Body Parts", "fruit": "Fruits",
            "food": "Food", "weather": "Weather",
            "family": "Family", "shape": "Shapes",
        }
        lower = title.lower()
        for key, topic in topics_map.items():
            if key in lower:
                return topic
        return "General"

    async def sync_channel_to_db(
        self,
        db: Session,
        channel_id: str | None = None,
        max_results: int = 50,
    ) -> dict:
        """Fetch videos from YouTube and upsert them into the DB."""
        if not self.api_key:
            return {"status": "error", "message": "YOUTUBE_API_KEY not set"}

        items = await self.get_channel_videos(channel_id, max_results)
        added, skipped = 0, 0

        for item in items:
            yt_id = item["id"].get("videoId") if isinstance(item["id"], dict) else item["id"]
            if not yt_id:
                continue

            existing = db.query(Video).filter(Video.youtube_id == yt_id).first()
            if existing:
                skipped += 1
                continue

            snippet = item.get("snippet", {})
            # Fetch full details for duration
            details = await self.get_video_details(yt_id)
            duration = 0
            if details:
                iso = details.get("contentDetails", {}).get("duration", "")
                duration = self._parse_duration(iso)

            title = snippet.get("title", "")
            description = snippet.get("description", "")

            video = Video(
                youtube_id=yt_id,
                title=title,
                description=description,
                thumbnail_url=(
                    snippet.get("thumbnails", {})
                    .get("high", {})
                    .get("url")
                ),
                duration_seconds=duration,
                difficulty=self._infer_difficulty(title, description),
                topic=self._infer_topic(title),
                order_index=added,
                published_at=snippet.get("publishedAt"),
            )
            db.add(video)
            added += 1

        db.commit()
        return {"status": "ok", "added": added, "skipped": skipped}
