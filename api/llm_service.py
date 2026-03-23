import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

class MissionGenerator:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            print("WARNING: GROQ_API_KEY not found. Using Mock MissionGenerator.")
            self.mock_mode = True
        else:
            self.client = Groq(api_key=self.api_key)
            self.mock_mode = False

    async def generate_mission(self, level: float, category: str, preferences: dict = None):
        if self.mock_mode:
            return {
                "title": f"MOCK Missiya {int(level)}",
                "instruction": "Tashqariga chiqing va yulduzlarni sanang.",
                "content": {
                    "target_sentence": "I see many stars in the sky.",
                    "vocabulary": ["stars", "sky"],
                    "fun_fact": "Vaznsizlikda siz bo'yingiz 2-3 santimetrga o'sishi mumkin!"
                }
            }

        interests = preferences.get("interests", "space and adventure") if preferences else "space and adventure"
        
        prompt = f"""
        Siz "English Adventure: Gravity Zero" o'yinining kontent generatorisiz. 
        O'quvchi darajasi: {level}/10. 
        Kategoriya: {category}.
        Qiziqishlari: {interests}.

        Vazifa: Vaznsizlik (Gravity Zero) mavzusida ingliz tilini o'rgatuvchi qiziqarli dars kontentini yaratib bering.
        Kontent quyidagi formatda bo'likda bo'lishi kerak (JSON):
        {{
            "title": "Missiya nomi",
            "instruction": "Bolaga nima qilish kerakligi haqida qisqa ko'rsatma",
            "content": {{
                "target_sentence": "Talaffuz qilinishi kerak bo'lgan inglizcha gap",
                "vocabulary": ["yangi", "so'zlar"],
                "fun_fact": "Vaznsizlik haqida bitta qiziqarli fakt"
            }}
        }}
        Javob faqat JSON bo'lsin.
        """

        response = self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "system", "content": "You are a creative English teacher for kids. Reply ONLY with JSON."},
                      {"role": "user", "content": prompt}],
            response_format={ "type": "json_object" }
        )

        mission_data = json.loads(response.choices[0].message.content)
        return mission_data
