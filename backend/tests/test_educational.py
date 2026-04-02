"""Tests for educational content API."""

import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)


class TestEducationalContent:
    """Tests for educational content endpoints."""

    def test_get_educational_content_success(self):
        """Test retrieving educational content successfully."""
        response = client.get("/api/v2/education/ocean/ocean_waves?locale=es")
        assert response.status_code == 200

        data = response.json()
        assert data["id"] == "ocean_waves"
        assert data["category"] == "ocean"
        assert "title" in data
        assert "scientific" in data
        assert "algorithmic" in data
        assert data["title"]["scientific"] == "Dinámica Oceánica"

    def test_get_educational_content_english(self):
        """Test retrieving content in English."""
        response = client.get("/api/v2/education/ocean/ocean_waves?locale=en")
        assert response.status_code == 200

        data = response.json()
        assert data["title"]["scientific"] == "Ocean Dynamics"

    def test_get_educational_content_not_found(self):
        """Test 404 response for non-existent content."""
        response = client.get("/api/v2/education/ocean/nonexistent")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_get_educational_content_default_locale(self):
        """Test default locale (es) is used when not specified."""
        response = client.get("/api/v2/education/ocean/ocean_waves")
        assert response.status_code == 200
        data = response.json()
        assert data["title"]["scientific"] == "Dinámica Oceánica"


class TestAlgorithmComparison:
    """Tests for algorithm comparison endpoint."""

    def test_compare_two_algorithms(self):
        """Test comparing two algorithms."""
        response = client.get("/api/v2/education/compare?algorithms=perlin,simplex")
        assert response.status_code == 200

        data = response.json()
        assert "algorithms" in data
        assert "comparisons" in data
        assert len(data["algorithms"]) == 2
        assert len(data["comparisons"]) == 2

    def test_compare_multiple_algorithms(self):
        """Test comparing multiple algorithms."""
        response = client.get(
            "/api/v2/education/compare?algorithms=perlin,simplex,worley,voronoi"
        )
        assert response.status_code == 200

        data = response.json()
        assert len(data["algorithms"]) == 4
        assert len(data["comparisons"]) == 4

    def test_compare_single_algorithm_error(self):
        """Test error when comparing only one algorithm."""
        response = client.get("/api/v2/education/compare?algorithms=perlin")
        assert response.status_code == 422

    def test_compare_too_many_algorithms_error(self):
        """Test error when comparing more than 5 algorithms."""
        response = client.get("/api/v2/education/compare?algorithms=a,b,c,d,e,f")
        assert response.status_code == 422


class TestCatalogEndpoints:
    """Tests for catalog endpoints."""

    def test_list_galaxies(self):
        """Test listing galaxies catalog."""
        response = client.get("/api/v2/catalog/galaxies")
        assert response.status_code == 200

        data = response.json()
        assert "objects" in data
        assert isinstance(data["objects"], list)
        assert len(data["objects"]) >= 2

        # Check structure
        for obj in data["objects"]:
            assert "id" in obj
            assert "name" in obj
            assert "type" in obj

    def test_list_planets(self):
        """Test listing planets catalog."""
        response = client.get("/api/v2/catalog/planets")
        assert response.status_code == 200

        data = response.json()
        assert "objects" in data
        assert len(data["objects"]) >= 2

    def test_get_galaxy_detail(self):
        """Test getting galaxy details."""
        response = client.get("/api/v2/catalog/galaxies/milky_way")
        assert response.status_code == 200

        data = response.json()
        assert data["id"] == "milky_way"
        assert data["name"] == "Vía Láctea"
        assert "physical_properties" in data
        assert "visual_properties" in data
        assert "fun_facts" in data

    def test_get_planet_detail(self):
        """Test getting planet details."""
        response = client.get("/api/v2/catalog/planets/earth")
        assert response.status_code == 200

        data = response.json()
        assert data["id"] == "earth"
        assert data["name"] == "Tierra"
        assert "physical_properties" in data

    def test_get_catalog_object_not_found(self):
        """Test 404 for non-existent catalog object."""
        response = client.get("/api/v2/catalog/galaxies/nonexistent")
        assert response.status_code == 404


class TestResponseModels:
    """Tests for response model validation."""

    def test_educational_content_structure(self):
        """Test that educational content has correct structure."""
        response = client.get("/api/v2/education/ocean/ocean_waves")
        data = response.json()

        # Validate scientific section
        scientific = data["scientific"]
        assert "concept" in scientific
        assert "analogy" in scientific
        assert "real_world_example" in scientific

        # Validate algorithmic section
        algorithmic = data["algorithmic"]
        assert "algorithm" in algorithmic
        assert "complexity" in algorithmic
        assert "why_this_algorithm" in algorithmic
        assert "parameters" in algorithmic

    def test_comparison_response_structure(self):
        """Test comparison response structure."""
        response = client.get("/api/v2/education/compare?algorithms=perlin,simplex")
        data = response.json()

        comparison = data["comparisons"][0]
        assert "algorithm" in comparison
        assert "advantage" in comparison
        assert "disadvantage" in comparison
        assert "best_for" in comparison
