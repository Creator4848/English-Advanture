import os
import json
import time
import shutil
from fastapi import FastAPI, UploadFile, File, Query, Request
from groq import Groq

app = FastAPI()

SPEAKING_TOPICS = [
    {"id": "animals",    "label": "Animals 🐾",  "prompt": "Talk about favorite animals"},
    {"id": "colors",     "label": "Colors 🎨",   "prompt": "Describe things by their color"},
    {"id": "family",     "label": "Family 👨‍👩‍👧",  "prompt": "Talk about family members"},
    {"id": "food",       "label": "Food 🍎",     "prompt": "Talk about foods you like or dislike"},
    {"id": "numbers",    "label": "Numbers 🔢",  "prompt": "Count and describe quantities"},
    {"id": "weather",    "label": "Weather ☀️",  "prompt": "Describe today's weather"},
    {"id": "school",     "label": "School 🏫",   "prompt": "Talk about school activities"},
    {"id": "free",       "label": "Free Talk 💬", "prompt": "Talk about anything you like"},
]

@app.post("/api/voice")
async def voice_handler(
    file:     UploadFile = File(...),
    user_id:  int        = Query(...),
    topic_id: str        = Query("free"),
    history:  str        = Query("[]"),
):
    temp_path = f"/tmp/voice_{user_id}_{int(time.time())}.webm"
    try:
        with open(temp_path, "wb") as buf:
            shutil.copyfileobj(file.file, buf)

        api_key = os.getenv("GROQ_API_KEY", "")
        if not api_key:
            return {"error": "GROQ_API_KEY not set"}

        client = Groq(api_key=api_key)
        
        with open(temp_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-large-v3",
                file=audio_file,
                response_format="text"
            )
        user_text = transcript.strip()
        
        hist_list = json.loads(history)
        topic_obj = next((t for t in SPEAKING_TOPICS if t["id"] == topic_id), SPEAKING_TOPICS[-1])
        topic_label = topic_obj["label"]

        system_prompt = f"""
        You are Alex, a friendly English tutor for children. 
        Your goal is to have a simple and engaging conversation in English.
        Current Topic: {topic_label}.

        Rules:
        1. Keep sentences short and simple (suitable for kids).
        2. Be encouraging and use emojis.
        3. If the user doesn't speak English, kindly remind them to try English, but you can say a few words in Uzbek to help (e.g. "Iltimos, inglizcha gapiring!").
        4. If the topic is "Free Talk 💬", you can talk about anything the user wants.
        5. ALWAYS respond in JSON format with two keys: "reply" (your text response) and "scores" (an object with fluency, grammar, and vocab scores from 1-10).
        Example response format: {{"reply": "Great job! Keep going! 🚀", "scores": {{"fluency": 9, "grammar": 8, "vocab": 8}}}}
        """
        
        chat_completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                *hist_list,
                {"role": "user", "content": user_text}
            ],
            response_format={"type": "json_object"}
        )
        
        res_data = json.loads(chat_completion.choices[0].message.content)
        return {
            "user_transcript": user_text,
            "ai_text":         res_data.get("reply", ""),
            "scores":          res_data.get("scores", {"fluency": 7, "grammar": 7, "vocab": 7})
        }
    except Exception as e:
        return {"error": str(e)}
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
