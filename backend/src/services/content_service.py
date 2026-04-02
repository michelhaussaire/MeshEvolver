"""Content service for loading educational content from filesystem."""

import json
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
        """Initialize content service."""
        if base_path is None:
            current_file = Path(__file__).resolve()
            self.base_path = current_file.parent.parent.parent.parent / "content"
        else:
            self.base_path = Path(base_path)

        self._cache: Dict[str, Any] = {}

    def _get_cache_key(self, locale: str, category: str, feature_id: str) -> str:
        return f"edu:{locale}:{category}:{feature_id}"

    def _get_catalog_cache_key(self, object_type: str, object_id: Optional[str] = None) -> str:
        if object_id:
            return f"catalog:{object_type}:{object_id}"
        return f"catalog:{object_type}:list"

    def _get_education_path(self, locale: str, category: str, feature_id: str) -> Path:
        return self.base_path / "education" / locale / category / f"{feature_id}.json"

    def _get_catalog_path(self, object_type: str, object_id: str) -> Path:
        return self.base_path / "catalog" / object_type / f"{object_id}.json"

    def _get_catalog_dir(self, object_type: str) -> Path:
        return self.base_path / "catalog" / object_type

    def _load_json(self, path: Path) -> Optional[Dict[str, Any]]:
        if not path.exists():
            return None
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return None

    def get_educational_content(self, category: str, feature_id: str, locale: str = "es") -> Optional[EducationalContentModel]:
        cache_key = self._get_cache_key(locale, category, feature_id)
        if cache_key in self._cache:
            return self._cache[cache_key]

        path = self._get_education_path(locale, category, feature_id)
        data = self._load_json(path)

        if data is None:
            return None

        try:
            content = EducationalContentModel.model_validate(data)
            self._cache[cache_key] = content
            return content
        except Exception:
            return None

    def get_catalog_object(self, object_type: str, object_id: str) -> Optional[CatalogObjectDetail]:
        cache_key = self._get_catalog_cache_key(object_type, object_id)
        if cache_key in self._cache:
            return self._cache[cache_key]

        path = self._get_catalog_path(object_type, object_id)
        data = self._load_json(path)

        if data is None:
            return None

        try:
            obj = CatalogObjectDetail.model_validate(data)
            self._cache[cache_key] = obj
            return obj
        except Exception:
            return None

    def list_catalog_objects(self, object_type: str) -> List[CatalogObjectSummary]:
        cache_key = self._get_catalog_cache_key(object_type)
        if cache_key in self._cache:
            return self._cache[cache_key]

        catalog_dir = self._get_catalog_dir(object_type)
        objects = []

        if not catalog_dir.exists():
            return objects

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

        self._cache[cache_key] = objects
        return objects

    def compare_algorithms(self, algorithms: List[str]) -> Dict[str, Any]:
        comparisons = []
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
            "worley_f1": {
                "advantage": "Natural cellular patterns, great for organic structures",
                "disadvantage": "Computationally expensive",
                "best_for": "Stone, water, cell patterns, vegetation clusters",
            },
            "worley_f2_f1": {
                "advantage": "Smooth transitions between cells",
                "disadvantage": "Complex to implement correctly",
                "best_for": "Cracks, veins, geological patterns",
            },
            "fbm": {
                "advantage": "Fractal detail at multiple scales",
                "disadvantage": "Can be slow with many octaves",
                "best_for": "Terrain, clouds, natural phenomena",
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
            comparisons.append({
                "algorithm": algo,
                "advantage": data["advantage"],
                "disadvantage": data["disadvantage"],
                "best_for": data["best_for"],
            })

        return {"algorithms": algorithms, "comparisons": comparisons}

    def clear_cache(self) -> None:
        self._cache.clear()

    def invalidate_cache(self, pattern: Optional[str] = None) -> None:
        if pattern is None:
            self.clear_cache()
        else:
            keys_to_remove = [k for k in self._cache.keys() if pattern in k]
            for key in keys_to_remove:
                del self._cache[key]


_content_service: Optional[ContentService] = None


def get_content_service() -> ContentService:
    global _content_service
    if _content_service is None:
        _content_service = ContentService()
    return _content_service
