"""
demo_seed.py
Seeds the SQLite database with demo videos, quizzes, a demo user,
and sample achievements so the app works out-of-the-box on Vercel
without any external API keys.
"""
from sqlalchemy.orm import Session
from models import User, Video, Quiz, QuizQuestion, Achievement
from auth_service import hash_password


DEMO_VIDEOS = [
    {
        "youtube_id": "k2LjrJB1qUw",
        "title": "Colors in English 🎨",
        "description": "Learn the most important colors in English through a fun animated song.",
        "thumbnail_url": "https://img.youtube.com/vi/k2LjrJB1qUw/hqdefault.jpg",
        "duration_seconds": 180,
        "difficulty": 1,
        "topic": "Colors",
        "order_index": 1,
    },
    {
        "youtube_id": "o5bvhHSvVWE",
        "title": "ABC Song for Kids 🔤",
        "description": "Sing the ABC song and learn the English alphabet!",
        "thumbnail_url": "https://img.youtube.com/vi/o5bvhHSvVWE/hqdefault.jpg",
        "duration_seconds": 150,
        "difficulty": 1,
        "topic": "Alphabet",
        "order_index": 2,
    },
    {
        "youtube_id": "eY8IoVTOVFE",
        "title": "Farm Animals 🐾",
        "description": "Meet the animals on the farm and learn their names in English.",
        "thumbnail_url": "https://img.youtube.com/vi/eY8IoVTOVFE/hqdefault.jpg",
        "duration_seconds": 240,
        "difficulty": 1,
        "topic": "Animals",
        "order_index": 3,
    },
    {
        "youtube_id": "hq3yfQnllfQ",
        "title": "Numbers 1-20 🔢",
        "description": "Count from 1 to 20 in English with this catchy song!",
        "thumbnail_url": "https://img.youtube.com/vi/hq3yfQnllfQ/hqdefault.jpg",
        "duration_seconds": 200,
        "difficulty": 1,
        "topic": "Numbers",
        "order_index": 4,
    },
    {
        "youtube_id": "tVlcKp3bWH8",
        "title": "My Family 👨‍👩‍👧",
        "description": "Talk about your family in English — mom, dad, sister, brother!",
        "thumbnail_url": "https://img.youtube.com/vi/tVlcKp3bWH8/hqdefault.jpg",
        "duration_seconds": 300,
        "difficulty": 2,
        "topic": "Family",
        "order_index": 5,
    },
    {
        "youtube_id": "VZZ0od_wiJ8",
        "title": "Fruits & Vegetables 🍎",
        "description": "Learn the names of fruits and vegetables in English.",
        "thumbnail_url": "https://img.youtube.com/vi/VZZ0od_wiJ8/hqdefault.jpg",
        "duration_seconds": 270,
        "difficulty": 2,
        "topic": "Food",
        "order_index": 6,
    },
    {
        "youtube_id": "gq8Smgi57ks",
        "title": "Weather & Seasons ☀️",
        "description": "How is the weather today? Sunny, cloudy or rainy?",
        "thumbnail_url": "https://img.youtube.com/vi/gq8Smgi57ks/hqdefault.jpg",
        "duration_seconds": 220,
        "difficulty": 2,
        "topic": "Weather",
        "order_index": 7,
    },
    {
        "youtube_id": "6-2IJVf4gPM",
        "title": "Body Parts 💪",
        "description": "Head, shoulders, knees and toes! Learn body parts in English.",
        "thumbnail_url": "https://img.youtube.com/vi/6-2IJVf4gPM/hqdefault.jpg",
        "duration_seconds": 190,
        "difficulty": 1,
        "topic": "Body Parts",
        "order_index": 8,
    },
]

DEMO_QUIZZES = [
    # Colors quiz  (video index 0)
    {
        "title": "Colors Quiz 🎨",
        "quiz_type": "image_choice",
        "pass_score": 70,
        "questions": [
            {
                "question": "What color is this? 🍎",
                "options": [{"id":"a","text":"Red","emoji":"🔴"},{"id":"b","text":"Blue","emoji":"🔵"},{"id":"c","text":"Green","emoji":"🟢"},{"id":"d","text":"Yellow","emoji":"🟡"}],
                "correct_ans": "a", "points": 10, "order_index": 1,
            },
            {
                "question": "What color is the sky? ☁️",
                "options": [{"id":"a","text":"Red","emoji":"🔴"},{"id":"b","text":"Blue","emoji":"🔵"},{"id":"c","text":"Green","emoji":"🟢"},{"id":"d","text":"Yellow","emoji":"🟡"}],
                "correct_ans": "b", "points": 10, "order_index": 2,
            },
            {
                "question": "What color is grass? 🌿",
                "options": [{"id":"a","text":"Red","emoji":"🔴"},{"id":"b","text":"Blue","emoji":"🔵"},{"id":"c","text":"Green","emoji":"🟢"},{"id":"d","text":"Yellow","emoji":"🟡"}],
                "correct_ans": "c", "points": 10, "order_index": 3,
            },
            {
                "question": "What color is a banana? 🍌",
                "options": [{"id":"a","text":"Orange","emoji":"🟠"},{"id":"b","text":"Blue","emoji":"🔵"},{"id":"c","text":"Purple","emoji":"🟣"},{"id":"d","text":"Yellow","emoji":"🟡"}],
                "correct_ans": "d", "points": 10, "order_index": 4,
            },
        ],
    },
    # ABC quiz  (video index 1)
    {
        "title": "Alphabet Quiz 🔤",
        "quiz_type": "image_choice",
        "pass_score": 70,
        "questions": [
            {
                "question": "🍎 starts with which letter?",
                "options": [{"id":"a","text":"A","emoji":"🅰️"},{"id":"b","text":"B","emoji":"🅱️"},{"id":"c","text":"C","emoji":"🇨"},{"id":"d","text":"D","emoji":"🇩"}],
                "correct_ans": "a", "points": 10, "order_index": 1,
            },
            {
                "question": "🐝 starts with which letter?",
                "options": [{"id":"a","text":"A","emoji":"🅰️"},{"id":"b","text":"B","emoji":"🅱️"},{"id":"c","text":"C","emoji":"🇨"},{"id":"d","text":"D","emoji":"🇩"}],
                "correct_ans": "b", "points": 10, "order_index": 2,
            },
            {
                "question": "🐱 starts with which letter?",
                "options": [{"id":"a","text":"A","emoji":"🅰️"},{"id":"b","text":"B","emoji":"🅱️"},{"id":"c","text":"C","emoji":"🇨"},{"id":"d","text":"D","emoji":"🇩"}],
                "correct_ans": "c", "points": 10, "order_index": 3,
            },
        ],
    },
    # Animals quiz  (video index 2)
    {
        "title": "Animals Quiz 🐾",
        "quiz_type": "image_choice",
        "pass_score": 70,
        "questions": [
            {
                "question": "Which animal says 'Moo'? 🐄",
                "options": [{"id":"a","text":"Dog","emoji":"🐶"},{"id":"b","text":"Cat","emoji":"🐱"},{"id":"c","text":"Cow","emoji":"🐄"},{"id":"d","text":"Duck","emoji":"🦆"}],
                "correct_ans": "c", "points": 10, "order_index": 1,
            },
            {
                "question": "Which animal says 'Woof'? 🐶",
                "options": [{"id":"a","text":"Dog","emoji":"🐶"},{"id":"b","text":"Cat","emoji":"🐱"},{"id":"c","text":"Cow","emoji":"🐄"},{"id":"d","text":"Duck","emoji":"🦆"}],
                "correct_ans": "a", "points": 10, "order_index": 2,
            },
            {
                "question": "Which animal says 'Quack'? 🦆",
                "options": [{"id":"a","text":"Dog","emoji":"🐶"},{"id":"b","text":"Cat","emoji":"🐱"},{"id":"c","text":"Cow","emoji":"🐄"},{"id":"d","text":"Duck","emoji":"🦆"}],
                "correct_ans": "d", "points": 10, "order_index": 3,
            },
        ],
    },
    # Numbers quiz  (video index 3)
    {
        "title": "Numbers Quiz 🔢",
        "quiz_type": "image_choice",
        "pass_score": 70,
        "questions": [
            {
                "question": "How many fingers? ✋",
                "options": [{"id":"a","text":"3","emoji":"3️⃣"},{"id":"b","text":"4","emoji":"4️⃣"},{"id":"c","text":"5","emoji":"5️⃣"},{"id":"d","text":"6","emoji":"6️⃣"}],
                "correct_ans": "c", "points": 10, "order_index": 1,
            },
            {
                "question": "5 + 5 = ?",
                "options": [{"id":"a","text":"8","emoji":"8️⃣"},{"id":"b","text":"9","emoji":"9️⃣"},{"id":"c","text":"10","emoji":"🔟"},{"id":"d","text":"11","emoji":"🔢"}],
                "correct_ans": "c", "points": 10, "order_index": 2,
            },
        ],
    },
]

DEMO_ACHIEVEMENTS = [
    {"code": "first_video",   "name": "Birinchi Dars 🎬",   "description": "Birinchi videoni ko'rdingiz!",       "criteria": {"type": "videos_completed", "value": 1}},
    {"code": "quiz_hero",     "name": "Test Qahramoni 🏆",  "description": "Birinchi testdan o'tdingiz!",        "criteria": {"type": "quiz_passed",       "value": 1}},
    {"code": "xp_100",        "name": "100 XP ⚡",          "description": "100 XP to'pladingiz!",              "criteria": {"type": "xp_gt",             "value": 99}},
    {"code": "xp_500",        "name": "500 XP 🌟",          "description": "500 XP to'pladingiz!",              "criteria": {"type": "xp_gt",             "value": 499}},
    {"code": "speaker",       "name": "Suhbatchi 🎙️",       "description": "Speaking Club da gaplashdingiz!",   "criteria": {"type": "speaking_session",  "value": 1}},
]


def seed_demo_data(db: Session) -> None:
    """
    Idempotent seed – runs on every cold-start but adds data only if DB is empty.
    Safe to call multiple times.
    """
    # ── Achievements ─────────────────────────────────────────────────────────
    if not db.query(Achievement).first():
        for a in DEMO_ACHIEVEMENTS:
            db.add(Achievement(**a))
        db.commit()

    # ── Videos + Quizzes ─────────────────────────────────────────────────────
    if not db.query(Video).first():
        for i, vdata in enumerate(DEMO_VIDEOS):
            video = Video(**vdata)
            db.add(video)
            db.flush()   # get video.id immediately

            # Attach quiz if defined
            if i < len(DEMO_QUIZZES):
                qdata = DEMO_QUIZZES[i]
                quiz = Quiz(
                    video_id   = video.id,
                    title      = qdata["title"],
                    quiz_type  = qdata["quiz_type"],
                    pass_score = qdata["pass_score"],
                )
                db.add(quiz)
                db.flush()

                for j, qst in enumerate(qdata["questions"]):
                    question = QuizQuestion(
                        quiz_id     = quiz.id,
                        question    = qst["question"],
                        options     = qst["options"],
                        correct_ans = qst["correct_ans"],
                        points      = qst["points"],
                        order_index = qst.get("order_index", j + 1),
                    )
                    db.add(question)

        db.commit()

    # ── Demo user (for quick testing) ────────────────────────────────────────
    from models import User
    if not db.query(User).filter(User.username == "demo").first():
        demo_user = User(
            username        = "demo",
            full_name       = "Demo O'quvchi",
            email           = "demo@english-adventure.uz",
            hashed_password = hash_password("demo1234"),
            xp              = 250,
            coins           = 30,
            level           = 1,
        )
        db.add(demo_user)
        db.commit()
