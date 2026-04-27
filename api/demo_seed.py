"""
demo_seed.py
Seeds the database with demo videos, quizzes (10 questions each), a demo user,
and sample achievements so the app works out-of-the-box on Vercel.
Smart upsert: if a quiz has fewer than target questions, it is rebuilt.
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
    {
        "youtube_id": "sDvBnwDQAzI",
        "title": "Shapes for Kids 🔷",
        "description": "Learn circles, squares, triangles and more shapes in English!",
        "thumbnail_url": "https://img.youtube.com/vi/sDvBnwDQAzI/hqdefault.jpg",
        "duration_seconds": 175,
        "difficulty": 1,
        "topic": "Shapes",
        "order_index": 9,
    },
    {
        "youtube_id": "5GFBcEMeS7Y",
        "title": "Days of the Week 📅",
        "description": "Monday, Tuesday, Wednesday... sing and learn all 7 days!",
        "thumbnail_url": "https://img.youtube.com/vi/5GFBcEMeS7Y/hqdefault.jpg",
        "duration_seconds": 160,
        "difficulty": 1,
        "topic": "Days",
        "order_index": 10,
    },
    {
        "youtube_id": "MrBWkFoCqcY",
        "title": "Greetings in English 👋",
        "description": "Hello! Hi! Good morning! Learn how to greet people in English.",
        "thumbnail_url": "https://img.youtube.com/vi/MrBWkFoCqcY/hqdefault.jpg",
        "duration_seconds": 185,
        "difficulty": 1,
        "topic": "Greetings",
        "order_index": 11,
    },
    {
        "youtube_id": "RgFzTQfXVpI",
        "title": "Clothes & Accessories 👗",
        "description": "Shirt, pants, shoes, hat — learn clothing words in English!",
        "thumbnail_url": "https://img.youtube.com/vi/RgFzTQfXVpI/hqdefault.jpg",
        "duration_seconds": 210,
        "difficulty": 2,
        "topic": "Clothes",
        "order_index": 12,
    },
    {
        "youtube_id": "SdrQgMCgxgM",
        "title": "School Objects 🎒",
        "description": "Pencil, book, ruler, eraser — learn school supplies in English!",
        "thumbnail_url": "https://img.youtube.com/vi/SdrQgMCgxgM/hqdefault.jpg",
        "duration_seconds": 195,
        "difficulty": 1,
        "topic": "School",
        "order_index": 13,
    },
    {
        "youtube_id": "CwIZsD_HoJY",
        "title": "Transport & Vehicles 🚗",
        "description": "Car, bus, train, airplane — learn vehicles and transport in English!",
        "thumbnail_url": "https://img.youtube.com/vi/CwIZsD_HoJY/hqdefault.jpg",
        "duration_seconds": 230,
        "difficulty": 2,
        "topic": "Transport",
        "order_index": 14,
    },
]


DEMO_QUIZZES = [
    # ── Colors (video index 0) ──────────────────────────────────────────────
    {
        "title": "Colors Quiz 🎨",
        "quiz_type": "image_choice",
        "pass_score": 70,
        "questions": [
            {"question": "What color is a ripe apple? 🍎", "options": [{"id":"a","text":"Red","emoji":"🔴"},{"id":"b","text":"Blue","emoji":"🔵"},{"id":"c","text":"Green","emoji":"🟢"},{"id":"d","text":"Yellow","emoji":"🟡"}], "correct_ans": "a", "points": 10, "order_index": 1},
            {"question": "What color is the clear sky? ☁️", "options": [{"id":"a","text":"Red","emoji":"🔴"},{"id":"b","text":"Blue","emoji":"🔵"},{"id":"c","text":"Green","emoji":"🟢"},{"id":"d","text":"Yellow","emoji":"🟡"}], "correct_ans": "b", "points": 10, "order_index": 2},
            {"question": "What color is fresh grass? 🌿", "options": [{"id":"a","text":"Red","emoji":"🔴"},{"id":"b","text":"Blue","emoji":"🔵"},{"id":"c","text":"Green","emoji":"🟢"},{"id":"d","text":"Purple","emoji":"🟣"}], "correct_ans": "c", "points": 10, "order_index": 3},
            {"question": "What color is a ripe banana? 🍌", "options": [{"id":"a","text":"Orange","emoji":"🟠"},{"id":"b","text":"Blue","emoji":"🔵"},{"id":"c","text":"Purple","emoji":"🟣"},{"id":"d","text":"Yellow","emoji":"🟡"}], "correct_ans": "d", "points": 10, "order_index": 4},
            {"question": "What color is a pumpkin? 🎃", "options": [{"id":"a","text":"Orange","emoji":"🟠"},{"id":"b","text":"Blue","emoji":"🔵"},{"id":"c","text":"Green","emoji":"🟢"},{"id":"d","text":"Yellow","emoji":"🟡"}], "correct_ans": "a", "points": 10, "order_index": 5},
            {"question": "What color is a grape? 🍇", "options": [{"id":"a","text":"Red","emoji":"🔴"},{"id":"b","text":"Purple","emoji":"🟣"},{"id":"c","text":"Green","emoji":"🟢"},{"id":"d","text":"Yellow","emoji":"🟡"}], "correct_ans": "b", "points": 10, "order_index": 6},
            {"question": "What color is snow? ❄️", "options": [{"id":"a","text":"White","emoji":"⬜"},{"id":"b","text":"Blue","emoji":"🔵"},{"id":"c","text":"Grey","emoji":"🩶"},{"id":"d","text":"Yellow","emoji":"🟡"}], "correct_ans": "a", "points": 10, "order_index": 7},
            {"question": "What color is charcoal? 🪨", "options": [{"id":"a","text":"White","emoji":"⬜"},{"id":"b","text":"Brown","emoji":"🟫"},{"id":"c","text":"Black","emoji":"⬛"},{"id":"d","text":"Red","emoji":"🔴"}], "correct_ans": "c", "points": 10, "order_index": 8},
            {"question": "What color is a chocolate bar? 🍫", "options": [{"id":"a","text":"Brown","emoji":"🟫"},{"id":"b","text":"Blue","emoji":"🔵"},{"id":"c","text":"Green","emoji":"🟢"},{"id":"d","text":"Purple","emoji":"🟣"}], "correct_ans": "a", "points": 10, "order_index": 9},
            {"question": "What color is a flamingo? 🦩", "options": [{"id":"a","text":"Red","emoji":"🔴"},{"id":"b","text":"Orange","emoji":"🟠"},{"id":"c","text":"Pink","emoji":"🩷"},{"id":"d","text":"Yellow","emoji":"🟡"}], "correct_ans": "c", "points": 10, "order_index": 10},
        ],
    },
    # ── Alphabet (video index 1) ────────────────────────────────────────────
    {
        "title": "Alphabet Quiz 🔤",
        "quiz_type": "image_choice",
        "pass_score": 70,
        "questions": [
            {"question": "🍎 Apple — what letter does it start with?", "options": [{"id":"a","text":"A"},{"id":"b","text":"B"},{"id":"c","text":"C"},{"id":"d","text":"D"}], "correct_ans": "a", "points": 10, "order_index": 1},
            {"question": "🐝 Bee — what letter does it start with?", "options": [{"id":"a","text":"A"},{"id":"b","text":"B"},{"id":"c","text":"C"},{"id":"d","text":"D"}], "correct_ans": "b", "points": 10, "order_index": 2},
            {"question": "🐱 Cat — what letter does it start with?", "options": [{"id":"a","text":"A"},{"id":"b","text":"B"},{"id":"c","text":"C"},{"id":"d","text":"D"}], "correct_ans": "c", "points": 10, "order_index": 3},
            {"question": "🦆 Duck — what letter does it start with?", "options": [{"id":"a","text":"A"},{"id":"b","text":"B"},{"id":"c","text":"D"},{"id":"d","text":"E"}], "correct_ans": "c", "points": 10, "order_index": 4},
            {"question": "🐘 Elephant — what letter does it start with?", "options": [{"id":"a","text":"C"},{"id":"b","text":"D"},{"id":"c","text":"E"},{"id":"d","text":"F"}], "correct_ans": "c", "points": 10, "order_index": 5},
            {"question": "🐸 Frog — what letter does it start with?", "options": [{"id":"a","text":"E"},{"id":"b","text":"F"},{"id":"c","text":"G"},{"id":"d","text":"H"}], "correct_ans": "b", "points": 10, "order_index": 6},
            {"question": "🦒 Giraffe — what letter does it start with?", "options": [{"id":"a","text":"F"},{"id":"b","text":"G"},{"id":"c","text":"H"},{"id":"d","text":"I"}], "correct_ans": "b", "points": 10, "order_index": 7},
            {"question": "🐴 Horse — what letter does it start with?", "options": [{"id":"a","text":"G"},{"id":"b","text":"H"},{"id":"c","text":"I"},{"id":"d","text":"J"}], "correct_ans": "b", "points": 10, "order_index": 8},
            {"question": "🦁 Lion — what letter does it start with?", "options": [{"id":"a","text":"K"},{"id":"b","text":"L"},{"id":"c","text":"M"},{"id":"d","text":"N"}], "correct_ans": "b", "points": 10, "order_index": 9},
            {"question": "🐒 Monkey — what letter does it start with?", "options": [{"id":"a","text":"L"},{"id":"b","text":"M"},{"id":"c","text":"N"},{"id":"d","text":"O"}], "correct_ans": "b", "points": 10, "order_index": 10},
        ],
    },
    # ── Animals (video index 2) ─────────────────────────────────────────────
    {
        "title": "Animals Quiz 🐾",
        "quiz_type": "image_choice",
        "pass_score": 70,
        "questions": [
            {"question": "Which animal says 'Moo'? 🐄", "options": [{"id":"a","text":"Dog","emoji":"🐶"},{"id":"b","text":"Cat","emoji":"🐱"},{"id":"c","text":"Cow","emoji":"🐄"},{"id":"d","text":"Duck","emoji":"🦆"}], "correct_ans": "c", "points": 10, "order_index": 1},
            {"question": "Which animal says 'Woof'? 🐶", "options": [{"id":"a","text":"Dog","emoji":"🐶"},{"id":"b","text":"Cat","emoji":"🐱"},{"id":"c","text":"Cow","emoji":"🐄"},{"id":"d","text":"Duck","emoji":"🦆"}], "correct_ans": "a", "points": 10, "order_index": 2},
            {"question": "Which animal says 'Quack'? 🦆", "options": [{"id":"a","text":"Dog","emoji":"🐶"},{"id":"b","text":"Pig","emoji":"🐷"},{"id":"c","text":"Sheep","emoji":"🐑"},{"id":"d","text":"Duck","emoji":"🦆"}], "correct_ans": "d", "points": 10, "order_index": 3},
            {"question": "Which animal says 'Meow'? 🐱", "options": [{"id":"a","text":"Cow","emoji":"🐄"},{"id":"b","text":"Cat","emoji":"🐱"},{"id":"c","text":"Frog","emoji":"🐸"},{"id":"d","text":"Horse","emoji":"🐴"}], "correct_ans": "b", "points": 10, "order_index": 4},
            {"question": "Which animal says 'Oink'? 🐷", "options": [{"id":"a","text":"Duck","emoji":"🦆"},{"id":"b","text":"Pig","emoji":"🐷"},{"id":"c","text":"Sheep","emoji":"🐑"},{"id":"d","text":"Dog","emoji":"🐶"}], "correct_ans": "b", "points": 10, "order_index": 5},
            {"question": "Which animal has a very long neck? 🦒", "options": [{"id":"a","text":"Elephant","emoji":"🐘"},{"id":"b","text":"Lion","emoji":"🦁"},{"id":"c","text":"Giraffe","emoji":"🦒"},{"id":"d","text":"Zebra","emoji":"🦓"}], "correct_ans": "c", "points": 10, "order_index": 6},
            {"question": "Which animal is the largest land animal? 🐘", "options": [{"id":"a","text":"Horse","emoji":"🐴"},{"id":"b","text":"Elephant","emoji":"🐘"},{"id":"c","text":"Cow","emoji":"🐄"},{"id":"d","text":"Lion","emoji":"🦁"}], "correct_ans": "b", "points": 10, "order_index": 7},
            {"question": "Which animal lays eggs and has feathers? 🐔", "options": [{"id":"a","text":"Dog","emoji":"🐶"},{"id":"b","text":"Cat","emoji":"🐱"},{"id":"c","text":"Chicken","emoji":"🐔"},{"id":"d","text":"Rabbit","emoji":"🐰"}], "correct_ans": "c", "points": 10, "order_index": 8},
            {"question": "Which animal lives in water and has fins? 🐟", "options": [{"id":"a","text":"Frog","emoji":"🐸"},{"id":"b","text":"Fish","emoji":"🐟"},{"id":"c","text":"Duck","emoji":"🦆"},{"id":"d","text":"Crab","emoji":"🦀"}], "correct_ans": "b", "points": 10, "order_index": 9},
            {"question": "Which animal has black and white stripes? 🦓", "options": [{"id":"a","text":"Giraffe","emoji":"🦒"},{"id":"b","text":"Lion","emoji":"🦁"},{"id":"c","text":"Zebra","emoji":"🦓"},{"id":"d","text":"Elephant","emoji":"🐘"}], "correct_ans": "c", "points": 10, "order_index": 10},
        ],
    },
    # ── Numbers (video index 3) ─────────────────────────────────────────────
    {
        "title": "Numbers Quiz 🔢",
        "quiz_type": "image_choice",
        "pass_score": 70,
        "questions": [
            {"question": "How many fingers on one hand? ✋", "options": [{"id":"a","text":"3"},{"id":"b","text":"4"},{"id":"c","text":"5"},{"id":"d","text":"6"}], "correct_ans": "c", "points": 10, "order_index": 1},
            {"question": "5 + 5 = ?", "options": [{"id":"a","text":"8"},{"id":"b","text":"9"},{"id":"c","text":"10"},{"id":"d","text":"11"}], "correct_ans": "c", "points": 10, "order_index": 2},
            {"question": "How many days in a week? 📅", "options": [{"id":"a","text":"5"},{"id":"b","text":"6"},{"id":"c","text":"7"},{"id":"d","text":"8"}], "correct_ans": "c", "points": 10, "order_index": 3},
            {"question": "3 + 4 = ?", "options": [{"id":"a","text":"6"},{"id":"b","text":"7"},{"id":"c","text":"8"},{"id":"d","text":"9"}], "correct_ans": "b", "points": 10, "order_index": 4},
            {"question": "Which number comes after 9? 🔟", "options": [{"id":"a","text":"8"},{"id":"b","text":"10"},{"id":"c","text":"11"},{"id":"d","text":"12"}], "correct_ans": "b", "points": 10, "order_index": 5},
            {"question": "10 - 3 = ?", "options": [{"id":"a","text":"5"},{"id":"b","text":"6"},{"id":"c","text":"7"},{"id":"d","text":"8"}], "correct_ans": "c", "points": 10, "order_index": 6},
            {"question": "How many sides does a triangle have? 🔺", "options": [{"id":"a","text":"2"},{"id":"b","text":"3"},{"id":"c","text":"4"},{"id":"d","text":"5"}], "correct_ans": "b", "points": 10, "order_index": 7},
            {"question": "2 × 4 = ?", "options": [{"id":"a","text":"6"},{"id":"b","text":"7"},{"id":"c","text":"8"},{"id":"d","text":"9"}], "correct_ans": "c", "points": 10, "order_index": 8},
            {"question": "Which number is between 14 and 16?", "options": [{"id":"a","text":"13"},{"id":"b","text":"15"},{"id":"c","text":"17"},{"id":"d","text":"18"}], "correct_ans": "b", "points": 10, "order_index": 9},
            {"question": "20 ÷ 4 = ?", "options": [{"id":"a","text":"4"},{"id":"b","text":"5"},{"id":"c","text":"6"},{"id":"d","text":"7"}], "correct_ans": "b", "points": 10, "order_index": 10},
        ],
    },
    # ── Family (video index 4) ──────────────────────────────────────────────
    {
        "title": "Family Quiz 👨‍👩‍👧",
        "quiz_type": "image_choice",
        "pass_score": 70,
        "questions": [
            {"question": "Your mother's husband is your...?", "options": [{"id":"a","text":"Uncle"},{"id":"b","text":"Brother"},{"id":"c","text":"Father"},{"id":"d","text":"Cousin"}], "correct_ans": "c", "points": 10, "order_index": 1},
            {"question": "Your father's mother is your...?", "options": [{"id":"a","text":"Aunt"},{"id":"b","text":"Sister"},{"id":"c","text":"Grandmother"},{"id":"d","text":"Mother"}], "correct_ans": "c", "points": 10, "order_index": 2},
            {"question": "Your parents' daughter is your...?", "options": [{"id":"a","text":"Sister"},{"id":"b","text":"Aunt"},{"id":"c","text":"Cousin"},{"id":"d","text":"Niece"}], "correct_ans": "a", "points": 10, "order_index": 3},
            {"question": "Your father's brother is your...?", "options": [{"id":"a","text":"Grandfather"},{"id":"b","text":"Uncle"},{"id":"c","text":"Brother"},{"id":"d","text":"Cousin"}], "correct_ans": "b", "points": 10, "order_index": 4},
            {"question": "Your mother's sister is your...?", "options": [{"id":"a","text":"Mother"},{"id":"b","text":"Cousin"},{"id":"c","text":"Aunt"},{"id":"d","text":"Sister"}], "correct_ans": "c", "points": 10, "order_index": 5},
            {"question": "Your brother's son is your...?", "options": [{"id":"a","text":"Cousin"},{"id":"b","text":"Son"},{"id":"c","text":"Nephew"},{"id":"d","text":"Brother"}], "correct_ans": "c", "points": 10, "order_index": 6},
            {"question": "Your parents' parents are your...?", "options": [{"id":"a","text":"Uncles"},{"id":"b","text":"Grandparents"},{"id":"c","text":"Cousins"},{"id":"d","text":"Aunts"}], "correct_ans": "b", "points": 10, "order_index": 7},
            {"question": "What do you call your aunt's child?", "options": [{"id":"a","text":"Sibling"},{"id":"b","text":"Nephew"},{"id":"c","text":"Cousin"},{"id":"d","text":"Niece"}], "correct_ans": "c", "points": 10, "order_index": 8},
            {"question": "The word for a male parent is...?", "options": [{"id":"a","text":"Mother"},{"id":"b","text":"Sister"},{"id":"c","text":"Father"},{"id":"d","text":"Brother"}], "correct_ans": "c", "points": 10, "order_index": 9},
            {"question": "The word for a female sibling is...?", "options": [{"id":"a","text":"Brother"},{"id":"b","text":"Sister"},{"id":"c","text":"Aunt"},{"id":"d","text":"Cousin"}], "correct_ans": "b", "points": 10, "order_index": 10},
        ],
    },
    # ── Food (video index 5) ────────────────────────────────────────────────
    {
        "title": "Food Quiz 🍎",
        "quiz_type": "image_choice",
        "pass_score": 70,
        "questions": [
            {"question": "Which fruit is red and round? 🍎", "options": [{"id":"a","text":"Banana","emoji":"🍌"},{"id":"b","text":"Apple","emoji":"🍎"},{"id":"c","text":"Grapes","emoji":"🍇"},{"id":"d","text":"Mango","emoji":"🥭"}], "correct_ans": "b", "points": 10, "order_index": 1},
            {"question": "Which vegetable is orange and long? 🥕", "options": [{"id":"a","text":"Carrot","emoji":"🥕"},{"id":"b","text":"Tomato","emoji":"🍅"},{"id":"c","text":"Peas","emoji":"🫛"},{"id":"d","text":"Broccoli","emoji":"🥦"}], "correct_ans": "a", "points": 10, "order_index": 2},
            {"question": "Which fruit is yellow and curved? 🍌", "options": [{"id":"a","text":"Strawberry","emoji":"🍓"},{"id":"b","text":"Orange","emoji":"🍊"},{"id":"c","text":"Banana","emoji":"🍌"},{"id":"d","text":"Watermelon","emoji":"🍉"}], "correct_ans": "c", "points": 10, "order_index": 3},
            {"question": "Which food is made from milk? 🧀", "options": [{"id":"a","text":"Bread","emoji":"🍞"},{"id":"b","text":"Cheese","emoji":"🧀"},{"id":"c","text":"Rice","emoji":"🍚"},{"id":"d","text":"Potato","emoji":"🥔"}], "correct_ans": "b", "points": 10, "order_index": 4},
            {"question": "Which fruit has a hard shell outside and is brown? 🥥", "options": [{"id":"a","text":"Apple","emoji":"🍎"},{"id":"b","text":"Pear","emoji":"🍐"},{"id":"c","text":"Coconut","emoji":"🥥"},{"id":"d","text":"Lemon","emoji":"🍋"}], "correct_ans": "c", "points": 10, "order_index": 5},
            {"question": "Which vegetable is green and looks like a small tree? 🥦", "options": [{"id":"a","text":"Cucumber","emoji":"🥒"},{"id":"b","text":"Lettuce","emoji":"🥬"},{"id":"c","text":"Broccoli","emoji":"🥦"},{"id":"d","text":"Celery","emoji":"🪴"}], "correct_ans": "c", "points": 10, "order_index": 6},
            {"question": "What drink comes from oranges? 🍊", "options": [{"id":"a","text":"Milk"},{"id":"b","text":"Orange Juice"},{"id":"c","text":"Water"},{"id":"d","text":"Tea"}], "correct_ans": "b", "points": 10, "order_index": 7},
            {"question": "Which food is a round flat bread? 🍕", "options": [{"id":"a","text":"Burger","emoji":"🍔"},{"id":"b","text":"Pizza","emoji":"🍕"},{"id":"c","text":"Sandwich","emoji":"🥪"},{"id":"d","text":"Hot dog","emoji":"🌭"}], "correct_ans": "b", "points": 10, "order_index": 8},
            {"question": "Which fruit is small, red, and heart-shaped? 🍓", "options": [{"id":"a","text":"Cherry","emoji":"🍒"},{"id":"b","text":"Raspberry","emoji":"🫐"},{"id":"c","text":"Strawberry","emoji":"🍓"},{"id":"d","text":"Apple","emoji":"🍎"}], "correct_ans": "c", "points": 10, "order_index": 9},
            {"question": "What is the yellow part inside an egg called?", "options": [{"id":"a","text":"Shell"},{"id":"b","text":"White"},{"id":"c","text":"Yolk"},{"id":"d","text":"Core"}], "correct_ans": "c", "points": 10, "order_index": 10},
        ],
    },
    # ── Weather (video index 6) ─────────────────────────────────────────────
    {
        "title": "Weather Quiz ☀️",
        "quiz_type": "image_choice",
        "pass_score": 70,
        "questions": [
            {"question": "What do we call water falling from the sky? 🌧️", "options": [{"id":"a","text":"Snow"},{"id":"b","text":"Rain"},{"id":"c","text":"Hail"},{"id":"d","text":"Fog"}], "correct_ans": "b", "points": 10, "order_index": 1},
            {"question": "White frozen water falling from the sky is called...? ❄️", "options": [{"id":"a","text":"Rain","emoji":"🌧️"},{"id":"b","text":"Hail"},{"id":"c","text":"Snow","emoji":"❄️"},{"id":"d","text":"Sleet"}], "correct_ans": "c", "points": 10, "order_index": 2},
            {"question": "When the sun shines and there are no clouds, we say it is...?", "options": [{"id":"a","text":"Cloudy"},{"id":"b","text":"Rainy"},{"id":"c","text":"Windy"},{"id":"d","text":"Sunny"}], "correct_ans": "d", "points": 10, "order_index": 3},
            {"question": "What do we carry to stay dry in the rain? ☂️", "options": [{"id":"a","text":"Umbrella"},{"id":"b","text":"Hat"},{"id":"c","text":"Gloves"},{"id":"d","text":"Scarf"}], "correct_ans": "a", "points": 10, "order_index": 4},
            {"question": "In which season do leaves fall from trees? 🍂", "options": [{"id":"a","text":"Spring"},{"id":"b","text":"Summer"},{"id":"c","text":"Autumn"},{"id":"d","text":"Winter"}], "correct_ans": "c", "points": 10, "order_index": 5},
            {"question": "In which season does snow usually fall? ⛄", "options": [{"id":"a","text":"Spring"},{"id":"b","text":"Summer"},{"id":"c","text":"Autumn"},{"id":"d","text":"Winter"}], "correct_ans": "d", "points": 10, "order_index": 6},
            {"question": "A powerful spinning storm is called a...?", "options": [{"id":"a","text":"Blizzard"},{"id":"b","text":"Tornado"},{"id":"c","text":"Drizzle"},{"id":"d","text":"Shower"}], "correct_ans": "b", "points": 10, "order_index": 7},
            {"question": "What do we call a colorful arc in the sky after rain? 🌈", "options": [{"id":"a","text":"Lightning"},{"id":"b","text":"Comet"},{"id":"c","text":"Rainbow"},{"id":"d","text":"Sunset"}], "correct_ans": "c", "points": 10, "order_index": 8},
            {"question": "Very strong moving air is called...?", "options": [{"id":"a","text":"Fog"},{"id":"b","text":"Wind"},{"id":"c","text":"Cloud"},{"id":"d","text":"Mist"}], "correct_ans": "b", "points": 10, "order_index": 9},
            {"question": "The hottest season of the year is...?", "options": [{"id":"a","text":"Spring"},{"id":"b","text":"Summer"},{"id":"c","text":"Autumn"},{"id":"d","text":"Winter"}], "correct_ans": "b", "points": 10, "order_index": 10},
        ],
    },
    # ── Body Parts (video index 7) ──────────────────────────────────────────
    {
        "title": "Body Parts Quiz 💪",
        "quiz_type": "image_choice",
        "pass_score": 70,
        "questions": [
            {"question": "Which body part do we use to see? 👀", "options": [{"id":"a","text":"Ears"},{"id":"b","text":"Eyes"},{"id":"c","text":"Nose"},{"id":"d","text":"Mouth"}], "correct_ans": "b", "points": 10, "order_index": 1},
            {"question": "Which body part do we use to hear? 👂", "options": [{"id":"a","text":"Ears"},{"id":"b","text":"Eyes"},{"id":"c","text":"Nose"},{"id":"d","text":"Mouth"}], "correct_ans": "a", "points": 10, "order_index": 2},
            {"question": "Which body part do we use to smell? 👃", "options": [{"id":"a","text":"Ears"},{"id":"b","text":"Eyes"},{"id":"c","text":"Nose"},{"id":"d","text":"Mouth"}], "correct_ans": "c", "points": 10, "order_index": 3},
            {"question": "Which body part do we use to eat and talk?", "options": [{"id":"a","text":"Nose"},{"id":"b","text":"Eyes"},{"id":"c","text":"Ears"},{"id":"d","text":"Mouth"}], "correct_ans": "d", "points": 10, "order_index": 4},
            {"question": "We walk and run using our...?", "options": [{"id":"a","text":"Arms"},{"id":"b","text":"Legs"},{"id":"c","text":"Hands"},{"id":"d","text":"Neck"}], "correct_ans": "b", "points": 10, "order_index": 5},
            {"question": "We write and wave using our...?", "options": [{"id":"a","text":"Legs"},{"id":"b","text":"Feet"},{"id":"c","text":"Hands"},{"id":"d","text":"Shoulders"}], "correct_ans": "c", "points": 10, "order_index": 6},
            {"question": "The part connecting your head to your body is your...?", "options": [{"id":"a","text":"Back"},{"id":"b","text":"Neck"},{"id":"c","text":"Chest"},{"id":"d","text":"Waist"}], "correct_ans": "b", "points": 10, "order_index": 7},
            {"question": "The hard white things in your mouth are your...?", "options": [{"id":"a","text":"Lips"},{"id":"b","text":"Tongue"},{"id":"c","text":"Teeth"},{"id":"d","text":"Gums"}], "correct_ans": "c", "points": 10, "order_index": 8},
            {"question": "Your fingers are on your...?", "options": [{"id":"a","text":"Feet"},{"id":"b","text":"Legs"},{"id":"c","text":"Hands"},{"id":"d","text":"Knees"}], "correct_ans": "c", "points": 10, "order_index": 9},
            {"question": "The top part of your body, above your neck, is your...?", "options": [{"id":"a","text":"Back"},{"id":"b","text":"Chest"},{"id":"c","text":"Head"},{"id":"d","text":"Shoulder"}], "correct_ans": "c", "points": 10, "order_index": 10},
        ],
    },
    # ── Shapes (video index 8) ──────────────────────────────────────────────
    {
        "title": "Shapes Quiz 🔷",
        "quiz_type": "image_choice",
        "pass_score": 70,
        "questions": [
            {"question": "A shape with 3 sides is called a...?", "options": [{"id":"a","text":"Square"},{"id":"b","text":"Circle"},{"id":"c","text":"Triangle"},{"id":"d","text":"Rectangle"}], "correct_ans": "c", "points": 10, "order_index": 1},
            {"question": "A shape with 4 equal sides is called a...?", "options": [{"id":"a","text":"Circle"},{"id":"b","text":"Square"},{"id":"c","text":"Triangle"},{"id":"d","text":"Oval"}], "correct_ans": "b", "points": 10, "order_index": 2},
            {"question": "A perfectly round shape with no corners is a...?", "options": [{"id":"a","text":"Square"},{"id":"b","text":"Hexagon"},{"id":"c","text":"Circle"},{"id":"d","text":"Diamond"}], "correct_ans": "c", "points": 10, "order_index": 3},
            {"question": "A rectangle has how many sides?", "options": [{"id":"a","text":"3"},{"id":"b","text":"4"},{"id":"c","text":"5"},{"id":"d","text":"6"}], "correct_ans": "b", "points": 10, "order_index": 4},
            {"question": "A shape with 6 sides is called a...?", "options": [{"id":"a","text":"Pentagon"},{"id":"b","text":"Hexagon"},{"id":"c","text":"Octagon"},{"id":"d","text":"Heptagon"}], "correct_ans": "b", "points": 10, "order_index": 5},
            {"question": "A shape with 5 sides is called a...?", "options": [{"id":"a","text":"Pentagon"},{"id":"b","text":"Hexagon"},{"id":"c","text":"Octagon"},{"id":"d","text":"Triangle"}], "correct_ans": "a", "points": 10, "order_index": 6},
            {"question": "A stop sign has how many sides?", "options": [{"id":"a","text":"6"},{"id":"b","text":"7"},{"id":"c","text":"8"},{"id":"d","text":"9"}], "correct_ans": "c", "points": 10, "order_index": 7},
            {"question": "A shape like a squashed circle is called an...?", "options": [{"id":"a","text":"Circle"},{"id":"b","text":"Oval"},{"id":"c","text":"Square"},{"id":"d","text":"Diamond"}], "correct_ans": "b", "points": 10, "order_index": 8},
            {"question": "A pizza slice is most like which shape?", "options": [{"id":"a","text":"Square"},{"id":"b","text":"Circle"},{"id":"c","text":"Triangle"},{"id":"d","text":"Rectangle"}], "correct_ans": "c", "points": 10, "order_index": 9},
            {"question": "A door is most like which shape?", "options": [{"id":"a","text":"Circle"},{"id":"b","text":"Triangle"},{"id":"c","text":"Rectangle"},{"id":"d","text":"Hexagon"}], "correct_ans": "c", "points": 10, "order_index": 10},
        ],
    },
    # ── Days (video index 9) ────────────────────────────────────────────────
    {
        "title": "Days of the Week Quiz 📅",
        "quiz_type": "image_choice",
        "pass_score": 70,
        "questions": [
            {"question": "Which day comes after Sunday?", "options": [{"id":"a","text":"Saturday"},{"id":"b","text":"Monday"},{"id":"c","text":"Friday"},{"id":"d","text":"Tuesday"}], "correct_ans": "b", "points": 10, "order_index": 1},
            {"question": "Which day comes before Friday?", "options": [{"id":"a","text":"Saturday"},{"id":"b","text":"Sunday"},{"id":"c","text":"Thursday"},{"id":"d","text":"Wednesday"}], "correct_ans": "c", "points": 10, "order_index": 2},
            {"question": "How many days are there in a week?", "options": [{"id":"a","text":"5"},{"id":"b","text":"6"},{"id":"c","text":"7"},{"id":"d","text":"8"}], "correct_ans": "c", "points": 10, "order_index": 3},
            {"question": "Which is the first day of the week?", "options": [{"id":"a","text":"Monday"},{"id":"b","text":"Sunday"},{"id":"c","text":"Saturday"},{"id":"d","text":"Friday"}], "correct_ans": "b", "points": 10, "order_index": 4},
            {"question": "Which is the last day of the week?", "options": [{"id":"a","text":"Friday"},{"id":"b","text":"Sunday"},{"id":"c","text":"Monday"},{"id":"d","text":"Saturday"}], "correct_ans": "d", "points": 10, "order_index": 5},
            {"question": "Monday is the __ day of the week.", "options": [{"id":"a","text":"1st"},{"id":"b","text":"2nd"},{"id":"c","text":"3rd"},{"id":"d","text":"4th"}], "correct_ans": "b", "points": 10, "order_index": 6},
            {"question": "What comes after Wednesday?", "options": [{"id":"a","text":"Tuesday"},{"id":"b","text":"Monday"},{"id":"c","text":"Thursday"},{"id":"d","text":"Friday"}], "correct_ans": "c", "points": 10, "order_index": 7},
            {"question": "The weekend days are Saturday and...?", "options": [{"id":"a","text":"Monday"},{"id":"b","text":"Friday"},{"id":"c","text":"Sunday"},{"id":"d","text":"Tuesday"}], "correct_ans": "c", "points": 10, "order_index": 8},
            {"question": "Wednesday is the __ day of the week.", "options": [{"id":"a","text":"3rd"},{"id":"b","text":"4th"},{"id":"c","text":"5th"},{"id":"d","text":"6th"}], "correct_ans": "b", "points": 10, "order_index": 9},
            {"question": "Which day comes between Tuesday and Thursday?", "options": [{"id":"a","text":"Monday"},{"id":"b","text":"Friday"},{"id":"c","text":"Wednesday"},{"id":"d","text":"Sunday"}], "correct_ans": "c", "points": 10, "order_index": 10},
        ],
    },
    # ── Greetings (video index 10) ──────────────────────────────────────────
    {
        "title": "Greetings Quiz 👋",
        "quiz_type": "image_choice",
        "pass_score": 70,
        "questions": [
            {"question": "How do you greet someone in the morning?", "options": [{"id":"a","text":"Good night"},{"id":"b","text":"Good morning"},{"id":"c","text":"Good evening"},{"id":"d","text":"Goodbye"}], "correct_ans": "b", "points": 10, "order_index": 1},
            {"question": "How do you say goodbye in English?", "options": [{"id":"a","text":"Hello"},{"id":"b","text":"Hi"},{"id":"c","text":"Goodbye"},{"id":"d","text":"Thanks"}], "correct_ans": "c", "points": 10, "order_index": 2},
            {"question": "What do you say when you meet someone for the first time?", "options": [{"id":"a","text":"See you later"},{"id":"b","text":"Nice to meet you"},{"id":"c","text":"How are you?"},{"id":"d","text":"Goodbye"}], "correct_ans": "b", "points": 10, "order_index": 3},
            {"question": "How do you ask someone their name?", "options": [{"id":"a","text":"How old are you?"},{"id":"b","text":"Where are you from?"},{"id":"c","text":"What is your name?"},{"id":"d","text":"How are you?"}], "correct_ans": "c", "points": 10, "order_index": 4},
            {"question": "The reply to 'How are you?' is usually...?", "options": [{"id":"a","text":"My name is..."},{"id":"b","text":"I'm fine, thank you"},{"id":"c","text":"See you later"},{"id":"d","text":"Good morning"}], "correct_ans": "b", "points": 10, "order_index": 5},
            {"question": "'Please' is used when you want to...?", "options": [{"id":"a","text":"Say sorry"},{"id":"b","text":"Say thank you"},{"id":"c","text":"Make a polite request"},{"id":"d","text":"Greet someone"}], "correct_ans": "c", "points": 10, "order_index": 6},
            {"question": "How do you greet someone in the evening?", "options": [{"id":"a","text":"Good morning"},{"id":"b","text":"Good afternoon"},{"id":"c","text":"Good evening"},{"id":"d","text":"Good night"}], "correct_ans": "c", "points": 10, "order_index": 7},
            {"question": "'Thank you' — what is the polite reply?", "options": [{"id":"a","text":"Hello"},{"id":"b","text":"You're welcome"},{"id":"c","text":"Goodbye"},{"id":"d","text":"Please"}], "correct_ans": "b", "points": 10, "order_index": 8},
            {"question": "When you leave someone at night you say...?", "options": [{"id":"a","text":"Good morning"},{"id":"b","text":"Good afternoon"},{"id":"c","text":"Good evening"},{"id":"d","text":"Good night"}], "correct_ans": "d", "points": 10, "order_index": 9},
            {"question": "'Sorry' is used when you want to...?", "options": [{"id":"a","text":"Say thank you"},{"id":"b","text":"Greet someone"},{"id":"c","text":"Apologize"},{"id":"d","text":"Ask a question"}], "correct_ans": "c", "points": 10, "order_index": 10},
        ],
    },
    # ── Clothes (video index 11) ────────────────────────────────────────────
    {
        "title": "Clothes Quiz 👗",
        "quiz_type": "image_choice",
        "pass_score": 70,
        "questions": [
            {"question": "What do you wear on your feet to go outside? 👟", "options": [{"id":"a","text":"Hat"},{"id":"b","text":"Gloves"},{"id":"c","text":"Shoes"},{"id":"d","text":"Belt"}], "correct_ans": "c", "points": 10, "order_index": 1},
            {"question": "What do you wear on your head in winter? 🧢", "options": [{"id":"a","text":"Socks"},{"id":"b","text":"Hat"},{"id":"c","text":"Scarf"},{"id":"d","text":"Jacket"}], "correct_ans": "b", "points": 10, "order_index": 2},
            {"question": "What clothing covers your legs? 👖", "options": [{"id":"a","text":"Shirt"},{"id":"b","text":"Jacket"},{"id":"c","text":"Trousers"},{"id":"d","text":"Hat"}], "correct_ans": "c", "points": 10, "order_index": 3},
            {"question": "What do you wear on your hands in cold weather? 🧤", "options": [{"id":"a","text":"Socks"},{"id":"b","text":"Belt"},{"id":"c","text":"Gloves"},{"id":"d","text":"Shoes"}], "correct_ans": "c", "points": 10, "order_index": 4},
            {"question": "A warm item worn around your neck is a...?", "options": [{"id":"a","text":"Tie"},{"id":"b","text":"Scarf"},{"id":"c","text":"Necklace"},{"id":"d","text":"Belt"}], "correct_ans": "b", "points": 10, "order_index": 5},
            {"question": "A piece of clothing worn on the top half of the body is a...?", "options": [{"id":"a","text":"Skirt"},{"id":"b","text":"Trousers"},{"id":"c","text":"Shirt"},{"id":"d","text":"Socks"}], "correct_ans": "c", "points": 10, "order_index": 6},
            {"question": "What clothing item keeps you warm in winter outdoors? 🧥", "options": [{"id":"a","text":"T-shirt"},{"id":"b","text":"Coat"},{"id":"c","text":"Shorts"},{"id":"d","text":"Sandals"}], "correct_ans": "b", "points": 10, "order_index": 7},
            {"question": "You wear these on your feet inside your shoes?", "options": [{"id":"a","text":"Gloves"},{"id":"b","text":"Socks"},{"id":"c","text":"Hat"},{"id":"d","text":"Scarf"}], "correct_ans": "b", "points": 10, "order_index": 8},
            {"question": "A dress is usually worn by...?", "options": [{"id":"a","text":"Boys"},{"id":"b","text":"Both"},{"id":"c","text":"Girls"},{"id":"d","text":"Neither"}], "correct_ans": "c", "points": 10, "order_index": 9},
            {"question": "What do you wear in summer at the beach? 🩱", "options": [{"id":"a","text":"Winter coat"},{"id":"b","text":"Swimsuit"},{"id":"c","text":"Boots"},{"id":"d","text":"Gloves"}], "correct_ans": "b", "points": 10, "order_index": 10},
        ],
    },
    # ── School (video index 12) ─────────────────────────────────────────────
    {
        "title": "School Objects Quiz 🎒",
        "quiz_type": "image_choice",
        "pass_score": 70,
        "questions": [
            {"question": "What do you use to write on paper? ✏️", "options": [{"id":"a","text":"Ruler"},{"id":"b","text":"Eraser"},{"id":"c","text":"Pencil"},{"id":"d","text":"Scissors"}], "correct_ans": "c", "points": 10, "order_index": 1},
            {"question": "What do you use to remove pencil marks? 🧹", "options": [{"id":"a","text":"Pencil"},{"id":"b","text":"Eraser"},{"id":"c","text":"Ruler"},{"id":"d","text":"Glue"}], "correct_ans": "b", "points": 10, "order_index": 2},
            {"question": "What do you use to measure length? 📏", "options": [{"id":"a","text":"Eraser"},{"id":"b","text":"Pencil"},{"id":"c","text":"Ruler"},{"id":"d","text":"Book"}], "correct_ans": "c", "points": 10, "order_index": 3},
            {"question": "What bag do students carry to school? 🎒", "options": [{"id":"a","text":"Suitcase"},{"id":"b","text":"Handbag"},{"id":"c","text":"Backpack"},{"id":"d","text":"Basket"}], "correct_ans": "c", "points": 10, "order_index": 4},
            {"question": "What do you use to cut paper? ✂️", "options": [{"id":"a","text":"Pencil"},{"id":"b","text":"Ruler"},{"id":"c","text":"Scissors"},{"id":"d","text":"Glue"}], "correct_ans": "c", "points": 10, "order_index": 5},
            {"question": "What do you read and study from? 📚", "options": [{"id":"a","text":"Notebook"},{"id":"b","text":"Book"},{"id":"c","text":"Magazine"},{"id":"d","text":"Newspaper"}], "correct_ans": "b", "points": 10, "order_index": 6},
            {"question": "What do teachers write on at the front of the class? 📋", "options": [{"id":"a","text":"Paper"},{"id":"b","text":"Notebook"},{"id":"c","text":"Whiteboard"},{"id":"d","text":"Book"}], "correct_ans": "c", "points": 10, "order_index": 7},
            {"question": "What do you use to stick things together? 🖇️", "options": [{"id":"a","text":"Scissors"},{"id":"b","text":"Glue"},{"id":"c","text":"Eraser"},{"id":"d","text":"Ruler"}], "correct_ans": "b", "points": 10, "order_index": 8},
            {"question": "You write notes in a...?", "options": [{"id":"a","text":"Textbook"},{"id":"b","text":"Dictionary"},{"id":"c","text":"Notebook"},{"id":"d","text":"Calendar"}], "correct_ans": "c", "points": 10, "order_index": 9},
            {"question": "A device used for drawing circles is a...?", "options": [{"id":"a","text":"Ruler"},{"id":"b","text":"Compass"},{"id":"c","text":"Pencil"},{"id":"d","text":"Protractor"}], "correct_ans": "b", "points": 10, "order_index": 10},
        ],
    },
    # ── Transport (video index 13) ──────────────────────────────────────────
    {
        "title": "Transport Quiz 🚗",
        "quiz_type": "image_choice",
        "pass_score": 70,
        "questions": [
            {"question": "Which vehicle flies in the sky? ✈️", "options": [{"id":"a","text":"Car","emoji":"🚗"},{"id":"b","text":"Airplane","emoji":"✈️"},{"id":"c","text":"Bus","emoji":"🚌"},{"id":"d","text":"Train","emoji":"🚂"}], "correct_ans": "b", "points": 10, "order_index": 1},
            {"question": "Which vehicle travels on train tracks? 🚂", "options": [{"id":"a","text":"Car","emoji":"🚗"},{"id":"b","text":"Motorcycle","emoji":"🏍️"},{"id":"c","text":"Train","emoji":"🚂"},{"id":"d","text":"Bicycle","emoji":"🚲"}], "correct_ans": "c", "points": 10, "order_index": 2},
            {"question": "Which vehicle carries many passengers on the road? 🚌", "options": [{"id":"a","text":"Bicycle","emoji":"🚲"},{"id":"b","text":"Bus","emoji":"🚌"},{"id":"c","text":"Motorcycle","emoji":"🏍️"},{"id":"d","text":"Scooter"}], "correct_ans": "b", "points": 10, "order_index": 3},
            {"question": "Which vehicle travels on water? ⛵", "options": [{"id":"a","text":"Car","emoji":"🚗"},{"id":"b","text":"Helicopter","emoji":"🚁"},{"id":"c","text":"Boat","emoji":"⛵"},{"id":"d","text":"Bus","emoji":"🚌"}], "correct_ans": "c", "points": 10, "order_index": 4},
            {"question": "Which vehicle has two wheels and you pedal? 🚲", "options": [{"id":"a","text":"Car","emoji":"🚗"},{"id":"b","text":"Bus","emoji":"🚌"},{"id":"c","text":"Bicycle","emoji":"🚲"},{"id":"d","text":"Train","emoji":"🚂"}], "correct_ans": "c", "points": 10, "order_index": 5},
            {"question": "What vehicle do firefighters use? 🚒", "options": [{"id":"a","text":"Police car"},{"id":"b","text":"Ambulance"},{"id":"c","text":"Fire truck"},{"id":"d","text":"Taxi"}], "correct_ans": "c", "points": 10, "order_index": 6},
            {"question": "A helicopter flies using...?", "options": [{"id":"a","text":"Wings"},{"id":"b","text":"Sails"},{"id":"c","text":"Propellers"},{"id":"d","text":"Engines only"}], "correct_ans": "c", "points": 10, "order_index": 7},
            {"question": "Which vehicle carries sick people to hospital? 🚑", "options": [{"id":"a","text":"Fire truck"},{"id":"b","text":"Ambulance"},{"id":"c","text":"Police car"},{"id":"d","text":"Bus"}], "correct_ans": "b", "points": 10, "order_index": 8},
            {"question": "A vehicle you hire to take you somewhere is a...?", "options": [{"id":"a","text":"Bus"},{"id":"b","text":"Train"},{"id":"c","text":"Taxi"},{"id":"d","text":"Tram"}], "correct_ans": "c", "points": 10, "order_index": 9},
            {"question": "A very large vehicle that carries goods on roads is a...?", "options": [{"id":"a","text":"Car"},{"id":"b","text":"Van"},{"id":"c","text":"Truck"},{"id":"d","text":"Scooter"}], "correct_ans": "c", "points": 10, "order_index": 10},
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

TARGET_QUESTIONS = 10


def seed_demo_data(db: Session) -> None:
    """
    Idempotent seed — runs on every cold-start.
    - Achievements: inserted once if table is empty.
    - Videos: inserted once if table is empty; new videos appended.
    - Quizzes: created per video; if a quiz has fewer than TARGET_QUESTIONS,
      its questions are deleted and recreated.
    - Demo user: created once.
    """
    # ── Achievements ─────────────────────────────────────────────────────────
    if not db.query(Achievement).first():
        for a in DEMO_ACHIEVEMENTS:
            db.add(Achievement(**a))
        db.commit()

    # ── Videos ───────────────────────────────────────────────────────────────
    for vdata in DEMO_VIDEOS:
        existing_video = db.query(Video).filter(Video.youtube_id == vdata["youtube_id"]).first()
        if not existing_video:
            video = Video(**vdata)
            db.add(video)
            db.flush()
        else:
            video = existing_video

        # Find matching quiz data by topic
        quiz_data = next(
            (q for q in DEMO_QUIZZES if q["title"].startswith(vdata["topic"].split()[0])),
            None,
        )
        if quiz_data is None:
            # Try matching by first word of quiz title against video topic
            for q in DEMO_QUIZZES:
                topic_word = vdata["topic"].lower()
                quiz_title_lower = q["title"].lower()
                if topic_word in quiz_title_lower:
                    quiz_data = q
                    break

        if quiz_data is None:
            continue

        # Find or create quiz for this video
        existing_quiz = db.query(Quiz).filter(Quiz.video_id == video.id).first()
        if not existing_quiz:
            quiz = Quiz(
                video_id   = video.id,
                title      = quiz_data["title"],
                quiz_type  = quiz_data["quiz_type"],
                pass_score = quiz_data["pass_score"],
            )
            db.add(quiz)
            db.flush()
            existing_quiz = quiz

        # Smart upsert: rebuild questions if fewer than target
        q_count = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == existing_quiz.id).count()
        if q_count < TARGET_QUESTIONS:
            db.query(QuizQuestion).filter(QuizQuestion.quiz_id == existing_quiz.id).delete()
            for j, qst in enumerate(quiz_data["questions"]):
                question = QuizQuestion(
                    quiz_id     = existing_quiz.id,
                    question    = qst["question"],
                    options     = qst["options"],
                    correct_ans = qst["correct_ans"],
                    points      = qst["points"],
                    order_index = qst.get("order_index", j + 1),
                )
                db.add(question)

    db.commit()

    # ── Demo user ─────────────────────────────────────────────────────────────
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
