"""
Challenge Engine Service.
Handles challenge loading, validation, and progress tracking.
"""

import json
import glob
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime

from backend.src.models.challenges import (
    Challenge,
    ChallengeObjective,
    ChallengeProgress,
    ChallengeCompletion,
    ValidationType,
    LeaderboardEntry,
)


class ChallengeEngine:
    """
    Engine for managing challenges, validation, and progress.
    Implements caching to avoid reloading challenges from filesystem.

    Note: This class uses a singleton pattern for in-memory caching.
    In a multi-worker deployment (e.g., multiple Uvicorn workers), each
    worker will have its own singleton instance. This means:
    - Cache invalidation via invalidate_cache() only affects the current worker
    - Progress state (_progress_store) is not shared between workers
    - Leaderboards (_leaderboards) are per-worker

    For production with multiple workers, consider using:
    - A shared cache like Redis for challenges
    - A shared database for progress and leaderboards
    - Or run with a single worker for MVP simplicity

    This limitation is acceptable for MVP but should be addressed before scaling.
    """

    _instance = None
    _challenges_cache: Optional[Dict[str, Challenge]] = None
    _progress_store: Dict[str, ChallengeProgress] = {}
    _leaderboards: Dict[str, List[LeaderboardEntry]] = {}

    def __new__(cls):
        """Singleton pattern to maintain cache across requests.

        WARNING: This singleton is per-process. In multi-worker setups,
        each worker has its own instance. See class docstring for details.
        """
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    async def load_challenges_from_filesystem(
        self, content_path: str = "content/challenges"
    ) -> Dict[str, Challenge]:
        """
        Load all challenges from JSON files in the content directory.
        Uses glob pattern to find all .json files recursively.

        Args:
            content_path: Root path to challenges content directory

        Returns:
            Dictionary mapping challenge IDs to Challenge objects
        """
        # Return cached challenges if available
        if self._challenges_cache is not None:
            return self._challenges_cache

        challenges = {}
        base_path = Path(content_path)

        if not base_path.exists():
            # Try relative to project root
            base_path = Path("/home/michel/Work/Dev/MeshEvolver") / content_path

        # Use glob to find all JSON files recursively
        pattern = str(base_path / "**" / "*.json")
        json_files = glob.glob(pattern, recursive=True)

        for file_path in json_files:
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    challenge = Challenge(**data)
                    challenges[challenge.id] = challenge
            except (json.JSONDecodeError, Exception) as e:
                # Log error but continue loading other challenges
                print(f"Error loading challenge from {file_path}: {e}")
                continue

        # Cache the loaded challenges
        self._challenges_cache = challenges
        return challenges

    def invalidate_cache(self) -> None:
        """Invalidate the challenges cache to force reload."""
        self._challenges_cache = None

    def validate_objective(
        self,
        objective: ChallengeObjective,
        current_value: Any,
    ) -> bool:
        """
        Validate if an objective is met based on current values.

        Args:
            objective: The objective to validate
            current_value: The current value of the parameter

        Returns:
            True if the objective is met, False otherwise
        """
        if current_value is None:
            return False

        try:
            current = float(current_value)
        except (TypeError, ValueError):
            return False

        if objective.validation_type == ValidationType.PARAMETER_MATCH:
            # Check if current value is within tolerance of target
            if objective.target_value is None or objective.tolerance is None:
                return False
            return abs(current - objective.target_value) <= objective.tolerance

        elif objective.validation_type == ValidationType.THRESHOLD:
            # Check if current value meets or exceeds threshold
            if objective.target_value is None:
                return False
            return current >= objective.target_value

        elif objective.validation_type == ValidationType.RANGE:
            # Check if current value is within range
            if objective.target_min is None or objective.target_max is None:
                return False
            return objective.target_min <= current <= objective.target_max

        return False

    def generate_hint(
        self,
        challenge: Challenge,
        objective: ChallengeObjective,
        current_value: Any,
        progress_percentage: float,
    ) -> Optional[str]:
        """
        Generate a hint for an objective based on current progress.

        Args:
            challenge: The challenge context
            objective: The objective needing a hint
            current_value: Current value of the parameter
            progress_percentage: Overall challenge progress (0-1)

        Returns:
            A hint string or None if no hint needed
        """
        # Use custom hint template if available
        if objective.hint_template:
            try:
                return objective.hint_template.format(
                    current=current_value,
                    target=objective.target_value,
                    min=objective.target_min,
                    max=objective.target_max,
                )
            except Exception:
                pass

        # Generate contextual hint based on validation type
        if objective.validation_type == ValidationType.PARAMETER_MATCH:
            if objective.target_value is not None and current_value is not None:
                try:
                    diff = float(current_value) - objective.target_value
                    if abs(diff) < (objective.tolerance or 0) * 2:
                        return f"You're very close! Adjust slightly {'down' if diff > 0 else 'up'}."
                    elif abs(diff) < (objective.tolerance or 0) * 5:
                        return f"Getting there! Try {'decreasing' if diff > 0 else 'increasing'} the value."
                    else:
                        return f"The target is around {objective.target_value}. Current: {current_value}"
                except (TypeError, ValueError):
                    pass

        elif objective.validation_type == ValidationType.THRESHOLD:
            if objective.target_value is not None and current_value is not None:
                try:
                    if float(current_value) < objective.target_value:
                        return f"Need to increase to at least {objective.target_value}."
                except (TypeError, ValueError):
                    pass

        elif objective.validation_type == ValidationType.RANGE:
            if objective.target_min is not None and objective.target_max is not None:
                if current_value is not None:
                    try:
                        val = float(current_value)
                        if val < objective.target_min:
                            return f"Too low! Need to be between {objective.target_min} and {objective.target_max}."
                        elif val > objective.target_max:
                            return f"Too high! Need to be between {objective.target_min} and {objective.target_max}."
                    except (TypeError, ValueError):
                        pass

        # Use general hints based on progress
        if progress_percentage < 0.25 and challenge.hints:
            return challenge.hints[0] if challenge.hints else None
        elif progress_percentage < 0.5 and len(challenge.hints) > 1:
            return challenge.hints[1]
        elif progress_percentage < 0.75 and len(challenge.hints) > 2:
            return challenge.hints[2]

        return None

    async def get_challenge(self, challenge_id: str) -> Optional[Challenge]:
        """Get a challenge by ID, loading from cache or filesystem."""
        if self._challenges_cache is None:
            await self.load_challenges_from_filesystem()
        return self._challenges_cache.get(challenge_id)

    async def list_challenges(
        self,
        category: Optional[str] = None,
        difficulty: Optional[str] = None,
    ) -> List[Challenge]:
        """
        List challenges with optional filters.

        Args:
            category: Filter by category
            difficulty: Filter by difficulty level

        Returns:
            List of matching challenges
        """
        challenges = await self.load_challenges_from_filesystem()
        result = list(challenges.values())

        if category:
            result = [c for c in result if c.category == category]
        if difficulty:
            result = [c for c in result if c.difficulty == difficulty]

        return result

    async def start_challenge(
        self,
        user_id: str,
        challenge_id: str,
    ) -> ChallengeProgress:
        """
        Start a challenge for a user.

        Args:
            user_id: The user starting the challenge
            challenge_id: The challenge to start

        Returns:
            New ChallengeProgress object
        """
        challenge = await self.get_challenge(challenge_id)
        if not challenge:
            raise ValueError(f"Challenge {challenge_id} not found")

        progress_key = f"{user_id}:{challenge_id}"
        progress = ChallengeProgress(
            user_id=user_id,
            challenge_id=challenge_id,
            started_at=datetime.now(),
        )
        self._progress_store[progress_key] = progress
        return progress

    async def update_progress(
        self,
        user_id: str,
        challenge_id: str,
        current_values: Dict[str, Any],
    ) -> tuple[ChallengeProgress, Dict[str, bool], List[str]]:
        """
        Update progress and check objective completion.

        Args:
            user_id: The user's ID
            challenge_id: The challenge ID
            current_values: Current parameter values

        Returns:
            Tuple of (progress, objectives_status, hints)
        """
        challenge = await self.get_challenge(challenge_id)
        if not challenge:
            raise ValueError(f"Challenge {challenge_id} not found")

        progress_key = f"{user_id}:{challenge_id}"
        progress = self._progress_store.get(progress_key)

        if not progress:
            # Auto-start if not started
            progress = await self.start_challenge(user_id, challenge_id)

        progress.current_values = current_values
        progress.attempts += 1

        # Check each objective
        objectives_status = {}
        hints = []
        completed_count = 0

        for obj in challenge.objectives:
            current_val = current_values.get(obj.id)
            is_completed = self.validate_objective(obj, current_val)
            objectives_status[obj.id] = is_completed

            if is_completed and obj.id not in progress.objectives_completed:
                progress.objectives_completed.append(obj.id)
                completed_count += 1

            # Generate hint if not completed
            if not is_completed:
                hint = self.generate_hint(
                    challenge,
                    obj,
                    current_val,
                    len(progress.objectives_completed) / len(challenge.objectives),
                )
                if hint:
                    hints.append(hint)

        return progress, objectives_status, hints

    async def complete_challenge(
        self,
        user_id: str,
        challenge_id: str,
    ) -> ChallengeCompletion:
        """
        Complete a challenge and calculate final score.

        Args:
            user_id: The user completing the challenge
            challenge_id: The challenge to complete

        Returns:
            ChallengeCompletion with results
        """
        challenge = await self.get_challenge(challenge_id)
        if not challenge:
            raise ValueError(f"Challenge {challenge_id} not found")

        progress_key = f"{user_id}:{challenge_id}"
        progress = self._progress_store.get(progress_key)

        if not progress:
            raise ValueError("Challenge not started")

        # Calculate time taken
        completed_at = datetime.now()
        time_taken = int((completed_at - progress.started_at).total_seconds())

        # Check all objectives
        all_objectives_completed = True
        for obj in challenge.objectives:
            current_val = progress.current_values.get(obj.id)
            if not self.validate_objective(obj, current_val):
                all_objectives_completed = False
                break

        if not all_objectives_completed:
            return ChallengeCompletion(
                success=False,
                score=0,
                objectives_completed=progress.objectives_completed,
                unlocks=[],
                time_taken_seconds=time_taken,
            )

        # Calculate score
        base_score = challenge.reward_points
        time_bonus = 0

        if challenge.time_limit_seconds and time_taken < challenge.time_limit_seconds:
            time_remaining = challenge.time_limit_seconds - time_taken
            time_bonus = min(time_remaining // 10, base_score // 2)

        attempt_penalty = max(0, (progress.attempts - 1) * 5)
        final_score = max(0, base_score + time_bonus - attempt_penalty)

        progress.completed_at = completed_at
        progress.score = final_score

        # Add to leaderboard
        await self._add_to_leaderboard(
            challenge_id, user_id, final_score, time_taken, completed_at
        )

        return ChallengeCompletion(
            success=True,
            score=final_score,
            objectives_completed=progress.objectives_completed,
            unlocks=challenge.unlocks_algorithms,
            time_taken_seconds=time_taken,
            bonus_points=time_bonus,
        )

    async def _add_to_leaderboard(
        self,
        challenge_id: str,
        user_id: str,
        score: int,
        time_taken: int,
        completed_at: datetime,
    ) -> None:
        """Add an entry to the challenge leaderboard."""
        if challenge_id not in self._leaderboards:
            self._leaderboards[challenge_id] = []

        entry = LeaderboardEntry(
            user_id=user_id,
            username=f"Player_{user_id[:8]}",  # Mock username
            score=score,
            time_taken_seconds=time_taken,
            completed_at=completed_at,
        )

        self._leaderboards[challenge_id].append(entry)
        # Sort by score (desc), then by time (asc)
        self._leaderboards[challenge_id].sort(
            key=lambda e: (-e.score, e.time_taken_seconds)
        )

    async def get_leaderboard(
        self,
        challenge_id: str,
        limit: int = 10,
    ) -> List[LeaderboardEntry]:
        """
        Get the leaderboard for a challenge.

        Args:
            challenge_id: The challenge ID
            limit: Maximum number of entries to return

        Returns:
            List of leaderboard entries
        """
        entries = self._leaderboards.get(challenge_id, [])
        return entries[:limit]

    def get_cached_challenges_count(self) -> int:
        """Get the number of challenges currently in cache."""
        return len(self._challenges_cache) if self._challenges_cache else 0
