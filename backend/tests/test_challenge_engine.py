"""
Unit tests for ChallengeEngine.
Tests challenge loading, validation, and progress tracking.
"""

import pytest
from datetime import datetime
from pathlib import Path

from backend.src.services.challenge_engine import ChallengeEngine
from backend.src.models.challenges import (
    ValidationType,
    ChallengeObjective,
    Challenge,
)


@pytest.fixture
def challenge_engine():
    """Create a fresh ChallengeEngine instance for each test."""
    engine = ChallengeEngine()
    engine.invalidate_cache()
    engine._progress_store = {}
    engine._leaderboards = {}
    return engine


@pytest.fixture
def sample_objectives():
    """Create sample objectives for testing."""
    return [
        ChallengeObjective(
            id="param_match",
            description="Match parameter within tolerance",
            target_value=100.0,
            tolerance=5.0,
            validation_type=ValidationType.PARAMETER_MATCH,
        ),
        ChallengeObjective(
            id="threshold",
            description="Meet threshold",
            target_value=50.0,
            validation_type=ValidationType.THRESHOLD,
        ),
        ChallengeObjective(
            id="range",
            description="Stay within range",
            target_min=10.0,
            target_max=20.0,
            validation_type=ValidationType.RANGE,
        ),
    ]


@pytest.fixture
def sample_challenge(sample_objectives):
    """Create a sample challenge for testing."""
    return Challenge(
        id="test_challenge",
        title="Test Challenge",
        description="A test challenge",
        category="test",
        difficulty="beginner",
        objectives=sample_objectives,
        time_limit_seconds=300,
        reward_points=100,
        unlocks_algorithms=["algo1"],
        required_algorithms=["algo0"],
        hints=["Hint 1", "Hint 2"],
    )


class TestLoadChallenges:
    """Tests for challenge loading from filesystem."""

    @pytest.mark.asyncio
    async def test_load_from_filesystem(self, challenge_engine):
        """Test loading challenges from JSON files."""
        challenges = await challenge_engine.load_challenges_from_filesystem()

        assert len(challenges) >= 3  # We created 3 sample challenges
        assert "habitable_planet_101" in challenges
        assert "gas_giant_hunter" in challenges
        assert "spiral_structure" in challenges

    @pytest.mark.asyncio
    async def test_cache_is_used(self, challenge_engine):
        """Test that cache is used on subsequent loads."""
        # First load
        challenges1 = await challenge_engine.load_challenges_from_filesystem()

        # Second load should use cache
        challenges2 = await challenge_engine.load_challenges_from_filesystem()

        assert challenges1 is challenges2

    @pytest.mark.asyncio
    async def test_invalidate_cache(self, challenge_engine):
        """Test cache invalidation."""
        await challenge_engine.load_challenges_from_filesystem()
        assert challenge_engine._challenges_cache is not None

        challenge_engine.invalidate_cache()
        assert challenge_engine._challenges_cache is None


class TestValidateObjective:
    """Tests for objective validation logic."""

    def test_parameter_match_within_tolerance(
        self, challenge_engine, sample_objectives
    ):
        """Test parameter match when value is within tolerance."""
        obj = sample_objectives[0]  # target=100, tolerance=5

        assert challenge_engine.validate_objective(obj, 100.0) is True
        assert challenge_engine.validate_objective(obj, 98.0) is True
        assert challenge_engine.validate_objective(obj, 104.0) is True
        assert challenge_engine.validate_objective(obj, 95.0) is True

    def test_parameter_match_outside_tolerance(
        self, challenge_engine, sample_objectives
    ):
        """Test parameter match when value is outside tolerance."""
        obj = sample_objectives[0]  # target=100, tolerance=5

        assert challenge_engine.validate_objective(obj, 90.0) is False
        assert challenge_engine.validate_objective(obj, 110.0) is False

    def test_threshold_met(self, challenge_engine, sample_objectives):
        """Test threshold validation when met."""
        obj = sample_objectives[1]  # target=50

        assert challenge_engine.validate_objective(obj, 50.0) is True
        assert challenge_engine.validate_objective(obj, 75.0) is True
        assert challenge_engine.validate_objective(obj, 100.0) is True

    def test_threshold_not_met(self, challenge_engine, sample_objectives):
        """Test threshold validation when not met."""
        obj = sample_objectives[1]  # target=50

        assert challenge_engine.validate_objective(obj, 49.0) is False
        assert challenge_engine.validate_objective(obj, 0.0) is False
        assert challenge_engine.validate_objective(obj, -10.0) is False

    def test_range_within_bounds(self, challenge_engine, sample_objectives):
        """Test range validation when within bounds."""
        obj = sample_objectives[2]  # min=10, max=20

        assert challenge_engine.validate_objective(obj, 10.0) is True
        assert challenge_engine.validate_objective(obj, 15.0) is True
        assert challenge_engine.validate_objective(obj, 20.0) is True

    def test_range_outside_bounds(self, challenge_engine, sample_objectives):
        """Test range validation when outside bounds."""
        obj = sample_objectives[2]  # min=10, max=20

        assert challenge_engine.validate_objective(obj, 9.9) is False
        assert challenge_engine.validate_objective(obj, 20.1) is False
        assert challenge_engine.validate_objective(obj, 0.0) is False

    def test_validate_none_value(self, challenge_engine, sample_objectives):
        """Test validation with None value."""
        obj = sample_objectives[0]
        assert challenge_engine.validate_objective(obj, None) is False

    def test_validate_invalid_type(self, challenge_engine, sample_objectives):
        """Test validation with non-numeric value."""
        obj = sample_objectives[0]
        assert challenge_engine.validate_objective(obj, "not a number") is False


class TestGenerateHint:
    """Tests for hint generation."""

    def test_hint_template_used(self, challenge_engine, sample_challenge):
        """Test that hint template is used when available."""
        obj = sample_challenge.objectives[0]
        obj.hint_template = "Current: {current}, Target: {target}"

        hint = challenge_engine.generate_hint(sample_challenge, obj, 95.0, 0.5)

        assert "95.0" in hint
        assert "100.0" in hint

    def test_parameter_match_hint_close(self, challenge_engine, sample_challenge):
        """Test contextual hint when close to target."""
        obj = sample_challenge.objectives[0]
        obj.hint_template = None

        hint = challenge_engine.generate_hint(sample_challenge, obj, 102.0, 0.5)

        assert hint is not None
        assert "close" in hint.lower() or "Adjust" in hint

    def test_parameter_match_hint_far(self, challenge_engine, sample_challenge):
        """Test contextual hint when far from target."""
        obj = sample_challenge.objectives[0]
        obj.hint_template = None

        hint = challenge_engine.generate_hint(sample_challenge, obj, 50.0, 0.5)

        assert hint is not None
        assert "target" in hint.lower() or "100" in hint

    def test_range_hint_too_low(self, challenge_engine, sample_challenge):
        """Test range hint when value is too low."""
        obj = sample_challenge.objectives[2]

        hint = challenge_engine.generate_hint(sample_challenge, obj, 5.0, 0.5)

        assert hint is not None
        assert "low" in hint.lower()

    def test_range_hint_too_high(self, challenge_engine, sample_challenge):
        """Test range hint when value is too high."""
        obj = sample_challenge.objectives[2]

        hint = challenge_engine.generate_hint(sample_challenge, obj, 25.0, 0.5)

        assert hint is not None
        assert "high" in hint.lower()

    def test_general_hint_by_progress(self, challenge_engine, sample_challenge):
        """Test that general hints are provided based on progress."""
        obj = sample_challenge.objectives[0]
        obj.hint_template = None

        # Low progress
        hint = challenge_engine.generate_hint(sample_challenge, obj, 50.0, 0.1)
        assert hint is not None


class TestChallengeFlow:
    """Tests for full challenge flow."""

    @pytest.mark.asyncio
    async def test_start_challenge(self, challenge_engine):
        """Test starting a challenge."""
        # First load challenges
        await challenge_engine.load_challenges_from_filesystem()

        progress = await challenge_engine.start_challenge(
            "user123", "habitable_planet_101"
        )

        assert progress.user_id == "user123"
        assert progress.challenge_id == "habitable_planet_101"
        assert progress.started_at is not None
        assert len(progress.objectives_completed) == 0

    @pytest.mark.asyncio
    async def test_update_progress(self, challenge_engine):
        """Test updating challenge progress."""
        await challenge_engine.load_challenges_from_filesystem()

        current_values = {
            "temperature_range": 288.0,
            "water_coverage": 0.6,
            "atmosphere_density": 0.95,
        }

        progress, statuses, hints = await challenge_engine.update_progress(
            "user123", "habitable_planet_101", current_values
        )

        assert progress.user_id == "user123"
        assert "temperature_range" in statuses
        assert isinstance(hints, list)

    @pytest.mark.asyncio
    async def test_complete_challenge_success(self, challenge_engine):
        """Test completing a challenge successfully."""
        await challenge_engine.load_challenges_from_filesystem()

        # Set up progress with all objectives met
        await challenge_engine.start_challenge("user123", "habitable_planet_101")
        await challenge_engine.update_progress(
            "user123",
            "habitable_planet_101",
            {
                "temperature_range": 288.0,
                "water_coverage": 0.6,
                "atmosphere_density": 0.95,
            },
        )

        completion = await challenge_engine.complete_challenge(
            "user123", "habitable_planet_101"
        )

        assert completion.success is True
        assert completion.score > 0
        assert "worley_f1" in completion.unlocks
        assert completion.time_taken_seconds >= 0

    @pytest.mark.asyncio
    async def test_complete_challenge_failure(self, challenge_engine):
        """Test completing a challenge without meeting objectives."""
        await challenge_engine.load_challenges_from_filesystem()

        await challenge_engine.start_challenge("user123", "habitable_planet_101")
        await challenge_engine.update_progress(
            "user123",
            "habitable_planet_101",
            {
                "temperature_range": 100.0,  # Too cold
                "water_coverage": 0.1,  # Not enough
                "atmosphere_density": 0.1,  # Too thin
            },
        )

        completion = await challenge_engine.complete_challenge(
            "user123", "habitable_planet_101"
        )

        assert completion.success is False
        assert completion.score == 0
        assert len(completion.unlocks) == 0

    @pytest.mark.asyncio
    async def test_leaderboard(self, challenge_engine):
        """Test leaderboard functionality."""
        await challenge_engine.load_challenges_from_filesystem()

        # Complete challenge with different scores
        for i in range(3):
            await challenge_engine.start_challenge(f"user{i}", "habitable_planet_101")
            await challenge_engine.update_progress(
                f"user{i}",
                "habitable_planet_101",
                {
                    "temperature_range": 288.0,
                    "water_coverage": 0.6,
                    "atmosphere_density": 0.95,
                },
            )
            await challenge_engine.complete_challenge(
                f"user{i}", "habitable_planet_101"
            )

        leaderboard = await challenge_engine.get_leaderboard("habitable_planet_101")

        assert len(leaderboard) > 0
        # Should be sorted by score descending
        if len(leaderboard) > 1:
            assert leaderboard[0].score >= leaderboard[1].score


class TestErrorHandling:
    """Tests for error handling."""

    @pytest.mark.asyncio
    async def test_get_nonexistent_challenge(self, challenge_engine):
        """Test getting a challenge that doesn't exist."""
        await challenge_engine.load_challenges_from_filesystem()
        challenge = await challenge_engine.get_challenge("nonexistent")
        assert challenge is None

    @pytest.mark.asyncio
    async def test_start_nonexistent_challenge(self, challenge_engine):
        """Test starting a challenge that doesn't exist."""
        await challenge_engine.load_challenges_from_filesystem()

        with pytest.raises(ValueError, match="not found"):
            await challenge_engine.start_challenge("user123", "nonexistent")

    @pytest.mark.asyncio
    async def test_complete_without_starting(self, challenge_engine):
        """Test completing a challenge that wasn't started."""
        await challenge_engine.load_challenges_from_filesystem()

        with pytest.raises(ValueError, match="not started"):
            await challenge_engine.complete_challenge("user123", "habitable_planet_101")
