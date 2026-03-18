import openai
import difflib
import os
from dotenv import load_dotenv

load_dotenv()

class VoiceAnalyzer:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            print("WARNING: OPENAI_API_KEY not found. Using Mock VoiceAnalyzer.")
            self.mock_mode = True
        else:
            self.client = openai.OpenAI(api_key=self.api_key)
            self.mock_mode = False

    async def analyze_pronunciation(self, audio_file_path: str, target_text: str):
        if self.mock_mode:
            return {
                "transcription": target_text,
                "similarity": 0.95,
                "feedback": "Ajoyib! (MOCK)",
                "points": 10
            }
        # ... rest of the original code ...
        # 1. Transcribe audio
        with open(audio_file_path, "rb") as audio_file:
            transcript = self.client.audio.transcriptions.create(
                model="whisper-1", 
                file=audio_file,
                response_format="text"
            )
        
        # 2. Compare with target text (Case-insensitive)
        similarity = difflib.SequenceMatcher(None, transcript.lower(), target_text.lower()).ratio()
        
        # 3. Decision logic
        feedback = ""
        points = 0
        if similarity > 0.9:
            feedback = "Ajoyib! Mukammal talaffuz."
            points = 10
        elif similarity > 0.7:
            feedback = "Yaxshi, lekin biroz aniqroq talaffuz qilishga harakat qiling."
            points = 7
        else:
            feedback = f"Siz '{transcript}' deb aytdingiz. Yana bir bor urinib ko'ring!"
            points = 2
            
        return {
            "transcription": transcript,
            "similarity": similarity,
            "feedback": feedback,
            "points": points
        }
