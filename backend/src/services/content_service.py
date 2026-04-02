"""Content service for loading educational content from filesystem."""

import json
import os
from typing import Dict, Optional, List, Any
from pathlib import Path

from src.models.educational import (
    EducationalContentModel,
    CatalogObjectDetail,
    CatalogObjectSummary,
)


class ContentService:
    """Service for loading and caching educational content."""

    def __init__(self, base_path: Optional[str] = None):
        """Initialize content service.

        Args:
            base_path: Base path to content directory. Defaults to project root.
        """
        if base_path is None:
            # Default to content directory relative to project root
            current_file = Path(__file__).resolve()
            # backend/src/services/content_service.py -> project root
            self.base_path = current_file.parent.parent.parent.parent / "content"
        else:
            self.base_path = Path(base_path)

        # In-memory cache: {cache_key: content}
        self._cache: Dict[str, Any] = {}

    def _get_cache_key(self, locale: str, category: str, feature_id: str) -> str:
        """Generate cache key for educational content."""
        return f"edu:{locale}:{category}:{feature_id}"

    def _get_catalog_cache_key(
        self, object_type: str, object_id: Optional[str] = None
    ) -> str:
        """Generate cache key for catalog content."""
        if object_id:
            return f"catalog:{object_type}:{object_id}"
        return f"catalog:{object_type}:list"

    def _get_education_path(self, locale: str, category: str, feature_id: str) -> Path:
        """Get filesystem path for educational content file."""
        return self.base_path / "education" / locale / category / f"{feature_id}.json"

    def _get_catalog_path(self, object_type: str, object_id: str) -> Path:
        """Get filesystem path for catalog object file."""
        return self.base_path / "catalog" / object_type / f"{object_id}.json"

    def _get_catalog_dir(self, object_type: str) -> Path:
        """Get filesystem path for catalog directory."""
        return self.base_path / "catalog" / object_type

    def _load_json(self, path: Path) -> Optional[Dict[str, Any]]:
        """Load JSON file from filesystem.

        Args:
            path: Path to JSON file.

        Returns:
            Parsed JSON content or None if file doesn't exist.
        """
        if not path.exists():
            return None

        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return None

    def get_educational_content(
        self, category: str, feature_id: str, locale: str = "es"
    ) -> Optional[EducationalContentModel]:
        """Get educational content for a specific feature.

        Args:
            category: Content category (ocean, atmosphere, vegetation, evolution)
            feature_id: Unique feature identifier
            locale: Language locale (es or en), defaults to es

        Returns:
            Educational content model or None if not found.
        """
        cache_key = self._get_cache_key(locale, category, feature_id)

        # Check cache first
        if cache_key in self._cache:
            return self._cache[cache_key]

        # Load from filesystem
        path = self._get_education_path(locale, category, feature_id)
        data = self._load_json(path)

        if data is None:
            return None

        # Parse and cache
        try:
            content = EducationalContentModel.model_validate(data)
            self._cache[cache_key] = content
            return content
        except Exception:
            return None

    def get_catalog_object(
        self, object_type: str, object_id: str
    ) -> Optional[CatalogObjectDetail]:
        """Get detailed catalog object information.

        Args:
            object_type: Type of object (galaxies, planets)
            object_id: Object identifier

        Returns:
            Catalog object detail or None if not found.
        """
        cache_key = self._get_catalog_cache_key(object_type, object_id)

        # Check cache first
        if cache_key in self._cache:
            return self._cache[cache_key]

        # Load from filesystem
        path = self._get_catalog_path(object_type, object_id)
        data = self._load_json(path)

        if data is None:
            return None

        # Parse and cache
        try:
            obj = CatalogObjectDetail.model_validate(data)
            self._cache[cache_key] = obj
            return obj
        except Exception:
            return None

    def list_catalog_objects(self, object_type: str) -> List[CatalogObjectSummary]:
        """List all objects of a specific type.

        Args:
            object_type: Type of object (galaxies, planets)

        Returns:
            List of catalog object summaries.
        """
        cache_key = self._get_catalog_cache_key(object_type)

        # Check cache first
        if cache_key in self._cache:
            return self._cache[cache_key]

        catalog_dir = self._get_catalog_dir(object_type)
        objects = []

        if not catalog_dir.exists():
            return objects

        # Load all JSON files in directory
        for json_file in catalog_dir.glob("*.json"):
            data = self._load_json(json_file)
            if data:
                try:
                    summary = CatalogObjectSummary(
                        id=data.get("id", json_file.stem),
                        name=data.get("name", json_file.stem),
                        type=data.get("type", "unknown"),
                    )
                    objects.append(summary)
                except Exception:
                    continue

        # Cache and return
        self._cache[cache_key] = objects
        return objects

    def get_algorithm_comparison(self, algorithms: List[str]) -> Dict[str, Any]:
        """Get comparison information for multiple algorithms.

        Args:
            algorithms: List of algorithm names to compare

        Returns:
            Dictionary with comparison data.
        """
        # This could be extended to load from a comparison database
        # For now, return basic comparison structure
        comparisons = []

        # Algorithm comparison data - could be loaded from JSON
        algorithm_data = {
            "perlin": {
                "advantage": "Classic algorithm, well documented",
                "disadvantage": "Visible directional artifacts (grid alignment)",
                "best_for": "General purpose noise generation",
            },
            "simplex": {
                "advantage": "No directional artifacts, faster in high dimensions",
                "disadvantage": "Slightly more complex implementation",
                "best_for": "High-quality procedural textures",
            },
            "worley": {
                "advantage": "Natural cellular patterns, great for organic structures",
                "disadvantage": "Computationally expensive",
                "best_for": "Stone, water, cell patterns",
            },
            "voronoi": {
                "advantage": "Sharp cell boundaries, mathematically precise",
                "disadvantage": "Can look artificial without post-processing",
                "best_for": "Cracked surfaces, mosaic patterns",
            },
        }

        for algo in algorithms:
            data = algorithm_data.get(
                algo.lower(),
                {
                    "advantage": "Information not available",
                    "disadvantage": "Information not available",
                    "best_for": "Information not available",
                },
            )
            comparisons.append(
                {
                    "algorithm": algo,
                    "advantage": data["advantage"],
                    "disadvantage": data["disadvantage"],
                    "best_for": data["best_for"],
                }
            )

        return {"algorithms": algorithms, "comparisons": comparisons}

    def clear_cache(self) -> None:
        """Clear all cached content."""
        self._cache.clear()

    def invalidate_cache(self, pattern: Optional[str] = None) -> None:
        """Invalidate specific cache entries.

        Args:
            pattern: Optional pattern to match cache keys. If None, clears all.
        """
        if pattern is None:
            self.clear_cache()
        else:
            keys_to_remove = [k for k in self._cache.keys() if pattern in k]
            for key in keys_to_remove:
                del self._cache[key]


# Singleton instance
_content_service: Optional[ContentService] = None


def get_content_service() -> ContentService:
    """Get singleton instance of ContentService."""
    global _content_service
    if _content_service is None:
        _content_service = ContentService()
    return _content_service
