"""
speaking_service.py
AI Speaking Partner for English Adventure.
Real-time WebSocket session using OpenAI Whisper + GPT-4o-mini.
"""
import json
import os
import time
from fastapi import WebSocket, WebSocketDisconnect
from openai import AsyncOpenAI
from sqlalchemy.orm import Session
from models import SpeakingSession, User

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY", ""))

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


async def speaking_partner_ws(
    websocket: WebSocket,
    user_id: int,
    topic_id: str,
    db: Session,
) -> None:
    await websocket.accept()

    # Resolve topic
    topic_obj   = next((t for t in SPEAKING_TOPICS if t["id"] == topic_id), SPEAKING_TOPICS[-1])
    topic_label = topic_obj["label"]
    topic_desc  = topic_obj["prompt"]
    topic_name = topic_label # Used in the new prompt structure

    history: list[dict] = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT.format(topic=f"{topic_label} – {topic_desc}"),
        }
    ]
    # greeting = f"Hi! I'm Alex 🌟 Today we're going to talk about {topic_label}! {topic_desc}. Are you ready? Let's go! 🚀"
    # history.append({"role": "assistant", "content": greeting})

    # await websocket.send_json({"type": "greeting", "text": greeting, "topic": topic_label})

    # 1. Send initial greeting
    greeting_text = f"Hi! I'm Alex. Let's talk about {topic_name}! How are you today?"
    if topic_id == "animals":
        greeting_text = "Hello! I love animals. What is your favorite animal? 🐾"
    
    await websocket.send_json({
        "type": "greeting",
        "text": greeting_text,
        "topic": topic_label
    })
    history.append({"role": "assistant", "content": greeting_text})


    transcript_log: list[dict] = []
    session_start  = time.time()
    total_fluency  = 0
    total_grammar  = 0
    total_vocab    = 0
    turn_count     = 0

    try:
        while True:
            data = await websocket.receive()

            user_text = ""

            # ── Audio blob → Whisper ─────────────────────────────────────
            if "bytes" in data and data["bytes"]:
                if not client:
                    await websocket.send_json({"type": "error", "message": "Groq API key not configured"})
                    continue
                
                # Save temp audio file
                temp_filename = f"temp_audio_{user_id}_{int(time.time())}.webm"
                with open(temp_filename, "wb") as f:
                    f.write(data["bytes"])
                
                try:
                    # Transcribe using Groq Whisper-large-v3
                    with open(temp_filename, "rb") as audio_file:
                        transcript_resp = client.audio.transcriptions.create(
                            model="whisper-large-v3",
                            file=audio_file,
                            response_format="text"
                        )
                    user_text = transcript_resp.strip()
                except Exception as e:
                    await websocket.send_json({"type": "error", "message": f"Transcription failed: {e}"})
                    continue
                finally:
                    if os.path.exists(temp_filename):
                        os.remove(temp_filename)

            # ── Text message fallback ────────────────────────────────────
            elif "text" in data:
                try:
                    payload   = json.loads(data["text"])
                    user_text = payload.get("text", "").strip()
                    if payload.get("type") == "end_session":
                        break
                except Exception:
                    continue

            if not user_text:
                continue

            history.append({"role": "user", "content": user_text})
            transcript_log.append({"role": "user", "content": user_text, "ts": time.time()})

            # ── GPT-4o-mini reply ────────────────────────────────────────
            # 2. Generate AI Reply using Groq Llama-3.3-70b
            system_prompt = f"""
            You are Alex, a friendly English tutor for children. 
            Topic: {topic_name}. 
            Task: Keep the conversation going with simple English. 
            Encourage the child. 
            Also, evaluate the user's sentence and provide scores (1-10) for:
            1. Fluency
            2. Grammar
            3. Vocabulary
            
            Reply ONLY in JSON format:
            {{
                "reply": "your conversational response",
                "scores": {{ "fluency": 8, "grammar": 7, "vocab": 9 }}
            }}
            """
            
            ai_reply = ""
            scores = {"fluency": 7, "grammar": 7, "vocab": 7} # defaults
            if not client:
                # Mock fallback
                ai_reply = f"That's interesting! Tell me more about {topic_name}."
                scores = {"fluency": 10, "grammar": 10, "vocab": 10}
            else:
                try:
                    chat_completion = await client.chat.completions.create(
                        model="llama-3.3-70b-versatile",
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_text}
                        ],
                        response_format={"type": "json_object"}
                    )
                    res_data = json.loads(chat_completion.choices[0].message.content)
                    ai_reply = res_data.get("reply", "")
                    scores = res_data.get("scores", {"fluency": 0, "grammar": 0, "vocab": 0})
                except Exception as e:
                    await websocket.send_json({"type": "error", "message": str(e)})
                    continue

            history.append({"role": "assistant", "content": ai_reply})
            transcript_log.append({"role": "assistant", "content": ai_reply, "ts": time.time()})

                score_resp = await client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": score_prompt}],
                    max_tokens=40,
                    temperature=0,
                )
                raw = score_resp.choices[0].message.content or "{}"
                # strip potential markdown fencing
                raw = raw.strip().strip("```json").strip("```").strip()
                scores = json.loads(raw)
            except Exception:
                pass

            total_fluency += scores.get("fluency", 7)
            total_grammar += scores.get("grammar", 7)
            total_vocab   += scores.get("vocab", 7)
            turn_count    += 1

            await websocket.send_json({
                "type":            "reply",
                "user_transcript": user_text,
                "ai_text":         ai_reply,
                "scores":          scores,
            })

    except WebSocketDisconnect:
        pass

    # ── Save session to DB ───────────────────────────────────────────────
    finally:
        duration = int(time.time() - session_start)
        if turn_count > 0:
            avg = lambda total: int(total / turn_count)
            session = SpeakingSession(
                user_id       = user_id,
                topic         = topic_label,
                transcript    = transcript_log,
                fluency_score = avg(total_fluency),
                grammar_score = avg(total_grammar),
                vocab_score   = avg(total_vocab),
                ai_feedback   = f"Great effort! You completed {turn_count} turns on {topic_label}.",
                duration_sec  = duration,
            )
            db.add(session)
            # Award XP for speaking practice
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                xp_gain = turn_count * 10
                user.xp    += xp_gain
                user.coins += xp_gain // 5
                new_level   = (user.xp // 1000) + 1
                if new_level > user.level:
                    user.level = new_level
            try:
                db.commit()
            except Exception:
                db.rollback()
