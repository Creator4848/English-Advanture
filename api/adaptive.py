class AdaptiveEngine:
    def __init__(self, k_factor=0.1):
        self.k_factor = k_factor # Sensitivity for adjustment

    def calculate_next_difficulty(self, user_current_level, performance_scores):
        """
        performance_scores: List of scores (0.0 to 1.0) from recent missions
        """
        if not performance_scores:
            return user_current_level
        
        avg_score = sum(performance_scores) / len(performance_scores)
        
        # Target score is 0.75 (Ideal for learning: not too easy, not too hard)
        adjustment = (avg_score - 0.75) * self.k_factor
        
        new_difficulty = user_current_level + adjustment
        
        # Clamp difficulty level between 1 and 10 and round to 1 decimal
        return round(max(1.0, min(10.0, new_difficulty)), 1)

    def select_next_mission(self, user_level, missions):
        """
        Selects a mission from the list that best matches the user's level.
        """
        # Sort missions by difficulty proximity to user level
        sorted_missions = sorted(missions, key=lambda m: abs(m.difficulty_rank - user_level))
        return sorted_missions[0] if sorted_missions else None
