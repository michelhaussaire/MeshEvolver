"""Educational content API router."""

from typing import List, Literal
from fastapi import APIRouter, HTTPException, Query, Depends

from src.models.educational import (
    EducationalContentModel,
    ComparisonRequest,
    ComparisonResponse,
    CatalogObjectSummary,
    CatalogObjectDetail,
    AlgorithmType,
)
from src.services.content_service import ContentService, get_content_service

router = APIRouter(prefix="/api/v2", tags=["education"])


@router.get(
    "/education/{category}/{feature_id}",
    response_model=EducationalContentModel,
    summary="Get educational content",
    description="Returns dual educational content (scientific + algorithmic) for a feature.",
    responses={
        404: {"description": "Content not found"},
        422: {"description": "Validation error"},
    },
)
async def get_educational_content(
    category: Literal["ocean", "atmosphere", "vegetation", "evolution"],
    feature_id: str,
    locale: Literal["es", "en"] = "es",
    service: ContentService = Depends(get_content_service),
):
    """
    Get educational content for a specific feature.

    - **category**: Content category (ocean, atmosphere, vegetation, evolution)
    - **feature_id**: Unique feature identifier (e.g., "ocean_waves")
    - **locale**: Language locale ("es" for Spanish, "en" for English)

    Returns dual educational content with both scientific and algorithmic explanations.
    """
    content = service.get_educational_content(category, feature_id, locale)

    if content is None:
        raise HTTPException(
            status_code=404,
            detail=f"Content not found: {category}/{feature_id} (locale: {locale})",
        )

    return content


@router.get(
    "/education/compare",
    response_model=ComparisonResponse,
    summary="Compare algorithms",
    description="Compares multiple noise algorithms side by side.",
    responses={
        422: {"description": "Validation error - invalid algorithm names"},
    },
)
async def compare_algorithms(
    algorithms: List[str] = Query(
        ...,
        description="Comma-separated list of algorithm names to compare (e.g., perlin,simplex,worley)",
    ),
    service: ContentService = Depends(get_content_service),
):
    """
    Compare multiple noise algorithms.

    - **algorithms**: List of algorithm names to compare (2-5 algorithms)

    Returns comparison data including complexity, pros/cons, and visual characteristics.
    """
    # Validate algorithm names
    valid_algorithms = [alg.value for alg in AlgorithmType]
    invalid_algorithms = [alg for alg in algorithms if alg not in valid_algorithms]

    if invalid_algorithms:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid algorithms: {invalid_algorithms}. Valid options: {valid_algorithms}",
        )

    comparison = service.compare_algorithms(algorithms)
    return comparison


@router.get(
    "/catalog/{object_type}",
    response_model=List[CatalogObjectSummary],
    summary="List catalog objects",
    description="Lists astronomical objects of a specific type.",
    responses={
        404: {"description": "Object type not found"},
    },
)
async def list_catalog_objects(
    object_type: Literal["galaxies", "planets", "nebulae", "stars"],
    service: ContentService = Depends(get_content_service),
):
    """
    List astronomical objects of a specific type.

    - **object_type**: Type of objects to list (galaxies, planets, nebulae, stars)

    Returns a list of object summaries including id, name, and type.
    """
    objects = service.list_catalog_objects(object_type)

    if objects is None:
        raise HTTPException(
            status_code=404,
            detail=f"Object type not found: {object_type}",
        )

    return objects


@router.get(
    "/catalog/{object_type}/{object_id}",
    response_model=CatalogObjectDetail,
    summary="Get catalog object details",
    description="Returns detailed information about a specific astronomical object.",
    responses={
        404: {"description": "Object not found"},
    },
)
async def get_catalog_object(
    object_type: Literal["galaxies", "planets", "nebulae", "stars"],
    object_id: str,
    service: ContentService = Depends(get_content_service),
):
    """
    Get detailed information about a specific astronomical object.

    - **object_type**: Type of object (galaxies, planets, nebulae, stars)
    - **object_id**: Unique object identifier (e.g., "milky_way", "earth")

    Returns complete object details including physical properties, visual properties,
    and parameters for recreating the object in CosmosLearn.
    """
    obj = service.get_catalog_object(object_type, object_id)

    if obj is None:
        raise HTTPException(
            status_code=404, detail=f"Object not found: {object_type}/{object_id}"
        )

    return obj
