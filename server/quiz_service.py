"""
quiz_service.py
Quiz auto-scoring logic for English Adventure.
Supports: drag_drop, image_choice, fill_blank, listening.
"""
from sqlalchemy.orm import Session
from models import Quiz, QuizQuestion, QuizResult, User, UserAchievement, Achievement


XP_PER_CORRECT = 15
XP_PASS_BONUS  = 50


class QuizService:

    def calculate_score(
        self, questions: list[QuizQuestion], answers: dict[str, str]
    ) -> dict:
        """
        answers: {str(question_id): "selected_option_id"}
        Returns: {score: 0-100, xp: int, correct: int, total: int, details: [...]}
        """
        total   = len(questions)
        correct = 0
        details = []

        for q in questions:
            user_ans = answers.get(str(q.id), "").strip().lower()
            is_correct = (user_ans == q.correct_ans.strip().lower())
            if is_correct:
                correct += 1
            details.append({
                "question_id": q.id,
                "question":    q.question,
                "user_answer": user_ans,
                "correct_answer": q.correct_ans,
                "is_correct": is_correct,
                "points": q.points if is_correct else 0,
            })

        score = int((correct / total) * 100) if total else 0
        xp = correct * XP_PER_CORRECT
        return {
            "score":   score,
            "correct": correct,
            "total":   total,
            "details": details,
            "xp":      xp,
        }

    def save_result(
        self,
        db: Session,
        user_id: int,
        quiz_id: int,
        score: int,
        answers: dict,
        passed: bool,
        xp_earned: int,
    ) -> QuizResult:
        """Persist quiz result and update user XP / level."""
        # Count previous attempts
        attempts = (
            db.query(QuizResult)
            .filter(QuizResult.user_id == user_id, QuizResult.quiz_id == quiz_id)
            .count()
        )

        # Add XP pass bonus only on first pass
        if passed and attempts == 0:
            xp_earned += XP_PASS_BONUS

        result = QuizResult(
            user_id    = user_id,
            quiz_id    = quiz_id,
            score      = score,
            answers    = answers,
            passed     = passed,
            xp_earned  = xp_earned,
            attempt_no = attempts + 1,
        )
        db.add(result)

        # Update user XP + level
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.xp    += xp_earned
            user.coins += xp_earned // 5
            new_level   = (user.xp // 1000) + 1
            if new_level > user.level:
                user.level = new_level

        db.commit()
        db.refresh(result)
        return result

    def check_achievements(self, db: Session, user_id: int) -> list[str]:
        """Check and grant newly earned achievements. Returns list of new badge codes."""
        earned_ids = {
            ua.achievement_id
            for ua in db.query(UserAchievement).filter(UserAchievement.user_id == user_id)
        }
        all_achv = db.query(Achievement).all()
        user     = db.query(User).filter(User.id == user_id).first()
        new_badges: list[str] = []

        for a in all_achv:
            if a.id in earned_ids:
                continue
            c = a.criteria or {}
            earned = False
            if c.get("type") == "xp_gt" and user and user.xp > c.get("value", 0):
                earned = True
            elif c.get("type") == "quiz_passed":
                passed_count = (
                    db.query(QuizResult)
                    .filter(QuizResult.user_id == user_id, QuizResult.passed.is_(True))
                    .count()
                )
                if passed_count >= c.get("value", 1):
                    earned = True

            if earned:
                ua = UserAchievement(user_id=user_id, achievement_id=a.id)
                db.add(ua)
                new_badges.append(a.code)

        if new_badges:
            db.commit()
        return new_badges
