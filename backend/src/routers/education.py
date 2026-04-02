"""Educational content API router."""

from typing import List, Literal
from fastapi import APIRouter, HTTPException, Query, Depends

from src.models.educational import (
    EducationalContentModel,
    ComparisonResponse,
    CatalogListResponse,
    CatalogObjectDetail,
)
from src.services.content_service import ContentService, get_content_service


router = APIRouter(prefix="/api/v2", tags=["education"])


@router.get(
    "/education/{category}/{feature_id}",
    response_model=EducationalContentModel,
    summary="Get educational content",
    description="Retrieve educational content for a specific feature with scientific and algorithmic information.",
    responses={
        404: {"description": "Content not found"},
        422: {"description": "Validation error"},
    },
)
async def get_educational_content(
    category: Literal["ocean", "atmosphere", "vegetation", "evolution"],
    feature_id: str,
    locale: str = Query(default="es", description="Language locale (es or en)"),
    content_service: ContentService = Depends(get_content_service),
) -> EducationalContentModel:
    """Get educational content for a specific feature.

    Args:
        category: Content category (ocean, atmosphere, vegetation, evolution)
        feature_id: Unique feature identifier
        locale: Language locale (es or en), defaults to es
        content_service: Content service dependency

    Returns:
        Educational content with scientific and algorithmic information

    Raises:
        HTTPException: 404 if content not found
    """
    content = content_service.get_educational_content(category, feature_id, locale)

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
    description="Compare multiple algorithms with their advantages, disadvantages, and best use cases.",
    responses={422: {"description": "Validation error - need at least 2 algorithms"}},
)
async def compare_algorithms(
    algorithms: str = Query(
        ...,
        description="Comma-separated list of algorithms (e.g., perlin,simplex,worley)",
        examples=["perlin,simplex"],
    ),
    content_service: ContentService = Depends(get_content_service),
) -> ComparisonResponse:
    """Compare multiple algorithms.

    Args:
        algorithms: Comma-separated list of algorithm names
        content_service: Content service dependency

    Returns:
        Comparison response with algorithm details

    Raises:
        HTTPException: 422 if less than 2 algorithms provided
    """
    algo_list = [a.strip().lower() for a in algorithms.split(",") if a.strip()]

    if len(algo_list) < 2:
        raise HTTPException(
            status_code=422, detail="At least 2 algorithms are required for comparison"
        )

    if len(algo_list) > 5:
        raise HTTPException(
            status_code=422, detail="Maximum 5 algorithms can be compared at once"
        )

    comparison_data = content_service.get_algorithm_comparison(algo_list)

    return ComparisonResponse(
        algorithms=comparison_data["algorithms"],
        comparisons=comparison_data["comparisons"],
    )


@router.get(
    "/catalog/{object_type}",
    response_model=CatalogListResponse,
    summary="List catalog objects",
    description="List all astronomical objects of a specific type (galaxies, planets).",
    responses={404: {"description": "Object type not found"}},
)
async def list_catalog_objects(
    object_type: Literal["galaxies", "planets"],
    content_service: ContentService = Depends(get_content_service),
) -> CatalogListResponse:
    """List all objects of a specific type.

    Args:
        object_type: Type of object (galaxies, planets)
        content_service: Content service dependency

    Returns:
        List of catalog object summaries
    """
    objects = content_service.list_catalog_objects(object_type)
    return CatalogListResponse(objects=objects)


@router.get(
    "/catalog/{object_type}/{object_id}",
    response_model=CatalogObjectDetail,
    summary="Get catalog object detail",
    description="Get detailed information about a specific astronomical object.",
    responses={404: {"description": "Object not found"}},
)
async def get_catalog_object(
    object_type: Literal["galaxies", "planets"],
    object_id: str,
    content_service: ContentService = Depends(get_content_service),
) -> CatalogObjectDetail:
    """Get detailed information about a catalog object.

    Args:
        object_type: Type of object (galaxies, planets)
        object_id: Object identifier
        content_service: Content service dependency

    Returns:
        Detailed catalog object information

    Raises:
        HTTPException: 404 if object not found
    """
    obj = content_service.get_catalog_object(object_type, object_id)

    if obj is None:
        raise HTTPException(
            status_code=404, detail=f"Object not found: {object_type}/{object_id}"
        )

    return obj
