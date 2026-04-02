"""
Integration tests for Challenges API endpoints.
Tests HTTP endpoints using FastAPI TestClient.
"""

import pytest
from fastapi.testclient import TestClient

from backend.src.main import app


@pytest.fixture
def client():
    """Create a test client."""
    return TestClient(app)


class TestListChallenges:
    """Tests for GET /api/v2/challenges/ endpoint."""

    def test_list_all_challenges(self, client):
        """Test listing all challenges."""
        response = client.get("/api/v2/challenges/")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 3  # We created 3 sample challenges

        # Check structure
        challenge = data[0]
        assert "id" in challenge
        assert "title" in challenge
        assert "category" in challenge
        assert "difficulty" in challenge
        assert "reward_points" in challenge
        assert "objectives_count" in challenge

    def test_filter_by_category(self, client):
        """Test filtering challenges by category."""
        response = client.get("/api/v2/challenges/?category=exoplanet_hunting")

        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 2  # habitable_planet_101 and gas_giant_hunter

        for challenge in data:
            assert challenge["category"] == "exoplanet_hunting"

    def test_filter_by_difficulty(self, client):
        """Test filtering challenges by difficulty."""
        response = client.get("/api/v2/challenges/?difficulty=beginner")

        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1

        for challenge in data:
            assert challenge["difficulty"] == "beginner"

    def test_filter_by_category_and_difficulty(self, client):
        """Test filtering by both category and difficulty."""
        response = client.get(
            "/api/v2/challenges/?category=exoplanet_hunting&difficulty=beginner"
        )

        assert response.status_code == 200
        data = response.json()

        for challenge in data:
            assert challenge["category"] == "exoplanet_hunting"
            assert challenge["difficulty"] == "beginner"


class TestGetChallenge:
    """Tests for GET /api/v2/challenges/{challenge_id} endpoint."""

    def test_get_existing_challenge(self, client):
        """Test getting an existing challenge."""
        response = client.get("/api/v2/challenges/habitable_planet_101")

        assert response.status_code == 200
        data = response.json()

        assert data["id"] == "habitable_planet_101"
        assert "title" in data
        assert "description" in data
        assert "category" in data
        assert "difficulty" in data
        assert "objectives" in data
        assert "time_limit_seconds" in data
        assert "reward_points" in data

    def test_get_nonexistent_challenge(self, client):
        """Test getting a challenge that doesn't exist."""
        response = client.get("/api/v2/challenges/nonexistent")

        assert response.status_code == 404
        data = response.json()
        assert "not found" in data["detail"].lower()


class TestStartChallenge:
    """Tests for POST /api/v2/challenges/{challenge_id}/start endpoint."""

    def test_start_challenge_success(self, client):
        """Test starting a challenge successfully."""
        response = client.post(
            "/api/v2/challenges/habitable_planet_101/start?user_id=user123"
        )

        assert response.status_code == 200
        data = response.json()

        assert data["user_id"] == "user123"
        assert data["challenge_id"] == "habitable_planet_101"
        assert "started_at" in data
        assert data["objectives_completed"] == []

    def test_start_nonexistent_challenge(self, client):
        """Test starting a nonexistent challenge."""
        response = client.post("/api/v2/challenges/nonexistent/start?user_id=user123")

        assert response.status_code == 404

    def test_start_without_user_id(self, client):
        """Test starting without user_id parameter."""
        response = client.post("/api/v2/challenges/habitable_planet_101/start")

        assert response.status_code == 422  # Validation error


class TestUpdateProgress:
    """Tests for POST /api/v2/challenges/{challenge_id}/progress endpoint."""

    def test_update_progress_success(self, client):
        """Test updating progress successfully."""
        # First start the challenge
        client.post("/api/v2/challenges/habitable_planet_101/start?user_id=user123")

        # Update progress
        response = client.post(
            "/api/v2/challenges/habitable_planet_101/progress?user_id=user123",
            json={
                "current_values": {
                    "temperature_range": 288.0,
                    "water_coverage": 0.6,
                    "atmosphere_density": 0.95,
                }
            },
        )

        assert response.status_code == 200
        data = response.json()

        assert "progress" in data
        assert "objectives_status" in data
        assert "hints" in data
        assert "completion_percentage" in data

        # Check objectives status
        statuses = data["objectives_status"]
        assert statuses["temperature_range"] is True
        assert statuses["water_coverage"] is True
        assert statuses["atmosphere_density"] is True

    def test_update_progress_nonexistent_challenge(self, client):
        """Test updating progress for nonexistent challenge."""
        response = client.post(
            "/api/v2/challenges/nonexistent/progress?user_id=user123",
            json={"current_values": {"param": 1.0}},
        )

        assert response.status_code == 404

    def test_update_progress_without_user_id(self, client):
        """Test updating progress without user_id."""
        response = client.post(
            "/api/v2/challenges/habitable_planet_101/progress",
            json={"current_values": {"param": 1.0}},
        )

        assert response.status_code == 422

    def test_update_progress_invalid_values(self, client):
        """Test updating progress with invalid values."""
        # Start first
        client.post("/api/v2/challenges/habitable_planet_101/start?user_id=user123")

        # Update with values that don't meet objectives
        response = client.post(
            "/api/v2/challenges/habitable_planet_101/progress?user_id=user123",
            json={
                "current_values": {
                    "temperature_range": 100.0,  # Too cold
                    "water_coverage": 0.1,  # Too low
                    "atmosphere_density": 0.1,  # Too thin
                }
            },
        )

        assert response.status_code == 200
        data = response.json()

        statuses = data["objectives_status"]
        assert statuses["temperature_range"] is False
        assert statuses["water_coverage"] is False
        assert statuses["atmosphere_density"] is False

        # Should have hints
        assert len(data["hints"]) > 0


class TestCompleteChallenge:
    """Tests for POST /api/v2/challenges/{challenge_id}/complete endpoint."""

    def test_complete_challenge_success(self, client):
        """Test completing a challenge successfully."""
        # Start and set up progress
        client.post("/api/v2/challenges/habitable_planet_101/start?user_id=user456")
        client.post(
            "/api/v2/challenges/habitable_planet_101/progress?user_id=user456",
            json={
                "current_values": {
                    "temperature_range": 288.0,
                    "water_coverage": 0.6,
                    "atmosphere_density": 0.95,
                }
            },
        )

        # Complete
        response = client.post(
            "/api/v2/challenges/habitable_planet_101/complete?user_id=user456"
        )

        assert response.status_code == 200
        data = response.json()

        assert data["success"] is True
        assert data["score"] > 0
        assert "worley_f1" in data["unlocks"]
        assert len(data["objectives_completed"]) == 3
        assert data["time_taken_seconds"] >= 0

    def test_complete_challenge_failure(self, client):
        """Test completing a challenge without meeting objectives."""
        # Start
        client.post("/api/v2/challenges/habitable_planet_101/start?user_id=user789")
        # Don't update progress, complete immediately

        response = client.post(
            "/api/v2/challenges/habitable_planet_101/complete?user_id=user789"
        )

        assert response.status_code == 200
        data = response.json()

        assert data["success"] is False
        assert data["score"] == 0
        assert data["unlocks"] == []

    def test_complete_nonexistent_challenge(self, client):
        """Test completing a nonexistent challenge."""
        response = client.post(
            "/api/v2/challenges/nonexistent/complete?user_id=user123"
        )

        assert response.status_code == 404

    def test_complete_without_starting(self, client):
        """Test completing without starting first."""
        response = client.post(
            "/api/v2/challenges/habitable_planet_101/complete?user_id=newuser"
        )

        assert response.status_code == 400


class TestLeaderboard:
    """Tests for GET /api/v2/challenges/{challenge_id}/leaderboard endpoint."""

    def test_get_leaderboard(self, client):
        """Test getting leaderboard."""
        response = client.get("/api/v2/challenges/habitable_planet_101/leaderboard")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_leaderboard_with_limit(self, client):
        """Test getting leaderboard with limit parameter."""
        response = client.get(
            "/api/v2/challenges/habitable_planet_101/leaderboard?limit=5"
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_leaderboard_nonexistent_challenge(self, client):
        """Test getting leaderboard for nonexistent challenge."""
        response = client.get("/api/v2/challenges/nonexistent/leaderboard")

        assert response.status_code == 404


class TestCacheInvalidation:
    """Tests for cache invalidation endpoint."""

    def test_invalidate_cache(self, client):
        """Test cache invalidation."""
        response = client.post("/api/v2/challenges/cache/invalidate")

        assert response.status_code == 200
        data = response.json()
        assert "invalidated" in data["message"].lower()


class TestChallengeCategories:
    """Tests verifying different challenge categories work."""

    def test_exoplanet_challenges(self, client):
        """Test exoplanet hunting challenges."""
        challenges = [
            "habitable_planet_101",
            "gas_giant_hunter",
        ]

        for challenge_id in challenges:
            response = client.get(f"/api/v2/challenges/{challenge_id}")
            assert response.status_code == 200
            data = response.json()
            assert data["category"] == "exoplanet_hunting"

    def test_galaxy_crafting_challenges(self, client):
        """Test galaxy crafting challenges."""
        response = client.get("/api/v2/challenges/spiral_structure")

        assert response.status_code == 200
        data = response.json()
        assert data["category"] == "galaxy_crafting"
        assert data["difficulty"] == "advanced"
