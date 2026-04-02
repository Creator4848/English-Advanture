import os
import json
from fastapi import FastAPI, Request
from groq import Groq

app = FastAPI()

@app.post("/api/chat")
async def chat_handler(request: Request):
    try:
        body = await request.json()
        api_key = os.getenv("GROQ_API_KEY", "")
        if not api_key:
            return {"ai_text": "Error: GROQ_API_KEY is not set."}

        client = Groq(api_key=api_key)
        
        topic_id = body.get("topic_id", "free")
        text     = body.get("text", "").strip()
        history  = body.get("history", [])

        system_prompt = f"You are Alex, a friendly English tutor for children. Topic ID: {topic_id}. Reply in JSON format: {{'reply': '...', 'scores': {{'fluency': 8, ...}}}}"
        
        chat_completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                *history,
                {"role": "user", "content": text}
            ],
            response_format={"type": "json_object"}
        )
        
        res_data = json.loads(chat_completion.choices[0].message.content)
        return {
            "user_transcript": text,
            "ai_text":         res_data.get("reply", ""),
            "scores":          res_data.get("scores", {"fluency": 7, "grammar": 7, "vocab": 7})
        }
    except Exception as e:
        return {"error": str(e)}
