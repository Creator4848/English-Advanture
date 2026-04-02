"""
speaking_service.py
AI Speaking Partner for English Adventure.
Multi-mode: WebSocket (Legacy) + HTTP (Vercel Compatibility).
"""
import json
import os
import time
import asyncio
from fastapi import WebSocket, WebSocketDisconnect
from groq import Groq
from sqlalchemy.orm import Session
from models import SpeakingSession, User

# Initialize Groq Client (Sync)
api_key = os.getenv("GROQ_API_KEY", "")
client = None
if api_key:
    client = Groq(api_key=api_key)

SYSTEM_PROMPT = """You are Alex 🌟, a friendly and encouraging English tutor for elementary school children (ages 6–12).

Rules:
- Speak simply with short sentences (max 2–3 sentences per reply).
- After each child response, give one gentle correction if needed (say "Good job! But we say '...' instead of '...'").
- Always end with an encouraging question or prompt to keep the conversation going.
- If the child seems stuck, give a hint.
- Stay strictly on the topic: {topic}.
- Use fun emojis occasionally to keep children engaged."""

SPEAKING_TOPICS = [
    {"id": "animals",    "label": "Animals 🐾",  "prompt": "Talk about your favorite animals"},
    {"id": "colors",     "label": "Colors 🎨",   "prompt": "Describe things by their color"},
    {"id": "family",     "label": "Family 👨‍👩‍👧",  "prompt": "Talk about your family members"},
    {"id": "food",       "label": "Food 🍎",     "prompt": "Talk about foods you like or dislike"},
    {"id": "numbers",    "label": "Numbers 🔢",  "prompt": "Count and describe quantities"},
    {"id": "weather",    "label": "Weather ☀️",  "prompt": "Describe today's weather"},
    {"id": "school",     "label": "School 🏫",   "prompt": "Talk about school activities"},
    {"id": "free",       "label": "Free Talk 💬", "prompt": "Talk about anything you like"},
]

# ── Core Logic (Stateless) ──────────────────────────────────────────────────

async def process_speaking_turn(user_text: str, topic_id: str, history: list = None):
    """
    Processes a single turn of AI conversation using Groq.
    Returns: { "reply": str, "scores": dict }
    """
    if not client:
        return {"reply": "Xatolik: GROQ_API_KEY o'rnatilmagan.", "scores": {}}

    topic_obj = next((t for t in SPEAKING_TOPICS if t["id"] == topic_id), SPEAKING_TOPICS[-1])
    topic_name = topic_obj["label"]

    system_prompt = f"""
    You are Alex, a friendly English tutor for children. 
    Topic: {topic_name}. 
    Task: Keep the conversation going with simple English. 
    Encourage the child. 
    Also, evaluate the user's sentence and provide scores (1-10) for:
    1. Fluency
    2. Grammar
    3. Vocabulary
    
    Reply ONLY in valid JSON format:
    {{
        "reply": "your conversational response",
        "scores": {{ "fluency": 8, "grammar": 7, "vocab": 9 }}
    }}
    """
    
    try:
        loop = asyncio.get_event_loop()
        chat_completion = await loop.run_in_executor(None, lambda: client.chat.completions.create(
            model="llama-3.3-70b-specdec", # Using specdec for faster performance
            messages=[
                {"role": "system", "content": system_prompt},
                *(history or []),
                {"role": "user", "content": user_text}
            ],
            response_format={"type": "json_object"}
        ))
        res_data = json.loads(chat_completion.choices[0].message.content)
        return {
            "reply": res_data.get("reply", ""),
            "scores": res_data.get("scores", {"fluency": 7, "grammar": 7, "vocab": 7})
        }
    except Exception as e:
        print(f"DEBUG AI Error: {e}")
        return {
            "reply": f"That's interesting! Tell me more about your ideas on {topic_name}.",
            "scores": {"fluency": 5, "grammar": 5, "vocab": 5}
        }


# ── WebSocket Handler (Legacy/Railway) ──────────────────────────────────────

async def speaking_partner_ws(
    websocket: WebSocket,
    user_id: int,
    topic_id: str,
    db: Session,
) -> None:
    await websocket.accept()

    if not client:
        await websocket.send_json({"type": "error", "message": "Backendda GROQ_API_KEY topilmadi."})
        await websocket.close()
        return

    topic_obj = next((t for t in SPEAKING_TOPICS if t["id"] == topic_id), SPEAKING_TOPICS[-1])
    topic_label = topic_obj["label"]

    history: list[dict] = [
        {"role": "system", "content": SYSTEM_PROMPT.format(topic=f"{topic_label}")}
    ]

    greeting_text = f"Hi! I'm Alex. Let's talk about {topic_label}! How are you today?"
    await websocket.send_json({"type": "greeting", "text": greeting_text, "topic": topic_label})
    history.append({"role": "assistant", "content": greeting_text})

    transcript_log = []
    session_start = time.time()
    scores_totals = {"fluency": 0, "grammar": 0, "vocab": 0}
    turn_count = 0

    try:
        while True:
            data = await websocket.receive()
            user_text = ""

            if "bytes" in data and data["bytes"]:
                temp_filename = f"temp_ws_{user_id}_{int(time.time())}.webm"
                with open(temp_filename, "wb") as f: f.write(data["bytes"])
                try:
                    with open(temp_filename, "rb") as audio_file:
                        loop = asyncio.get_event_loop()
                        transcript_resp = await loop.run_in_executor(None, lambda: client.audio.transcriptions.create(
                            model="whisper-large-v3", file=audio_file, response_format="text"
                        ))
                    user_text = transcript_resp.strip()
                except Exception as e:
                    await websocket.send_json({"type": "error", "message": f"Transcription error: {e}"})
                    continue
                finally:
                    if os.path.exists(temp_filename): os.remove(temp_filename)

            elif "text" in data:
                try:
                    payload = json.loads(data["text"])
                    user_text = payload.get("text", "").strip()
                    if payload.get("type") == "end_session": break
                except Exception: continue

            if not user_text: continue

            # Use core logic
            result = await process_speaking_turn(user_text, topic_id, history[-6:]) # Keep last 6 turns context
            ai_reply = result["reply"]
            scores = result["scores"]

            history.append({"role": "user", "content": user_text})
            history.append({"role": "assistant", "content": ai_reply})
            transcript_log.append({"role": "user", "content": user_text, "ts": time.time()})
            transcript_log.append({"role": "assistant", "content": ai_reply, "ts": time.time()})

            for k in scores_totals: scores_totals[k] += scores.get(k, 7)
            turn_count += 1

            await websocket.send_json({
                "type": "reply",
                "user_transcript": user_text,
                "ai_text": ai_reply,
                "scores": scores,
            })

    except WebSocketDisconnect: pass
    finally:
        # Save session to DB
        if turn_count > 0:
            duration = int(time.time() - session_start)
            avg = lambda total: int(total / turn_count)
            try:
                session_entry = SpeakingSession(
                    user_id=user_id, topic=topic_label, transcript=transcript_log,
                    fluency_score=avg(scores_totals["fluency"]),
                    grammar_score=avg(scores_totals["grammar"]),
                    vocab_score=avg(scores_totals["vocab"]),
                    ai_feedback=f"Completed {turn_count} turns on {topic_label}.",
                    duration_sec=duration,
                )
                db.add(session_entry)
                user = db.query(User).filter(User.id == user_id).first()
                if user:
                    xp_gain = turn_count * 10
                    user.xp += xp_gain
                    user.coins += xp_gain // 5
                    user.level = (user.xp // 1000) + 1
                db.commit()
            except Exception: db.rollback()
