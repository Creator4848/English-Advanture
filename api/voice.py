import os
import json
import time
import shutil
from fastapi import FastAPI, UploadFile, File, Query, Request
from groq import Groq

app = FastAPI()

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
        system_prompt = f"You are Alex, a friendly English tutor for children. Topic ID: {topic_id}. Reply in JSON format: {{'reply': '...', 'scores': {{'fluency': 8, ...}}}}"
        
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
