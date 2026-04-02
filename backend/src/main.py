from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sys
import os
import random
import json
from pathlib import Path

# Ensure the shared library is findable
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import challenge router
from src.routers import challenges

try:
    import procedural_graph_core
except ImportError:
    procedural_graph_core = None

# Import education router
from src.routers.education import router as education_router

app = FastAPI(
    title="ProceduralGraph AI",
    description="Backend API for procedural mesh generation with Rust core",
    version="0.1.0",
)

# CORS para el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Simplified for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include challenges router
app.include_router(challenges.router, prefix="/api/v2")


class GenomeParams(BaseModel):
    frequency: float
    lacunarity: float
    persistence: float
    octaves: int
    seed: int
    offset_x: float = 0.0
    offset_y: float = 0.0
    ridge_threshold: float = 0.5
    turbulence: float = 0.0


class FitnessGenome(BaseModel):
    genome: GenomeParams
    fitness: float


class EvolutionRequest(BaseModel):
    population: List[FitnessGenome]
    mutation_rate: float = 0.1
    elitism_count: int = 1


class GalaxyGenomeParams(BaseModel):
    num_arms: int
    arm_tightness: float
    core_density: float
    arm_spread: float
    star_count: int
    color_temperature: float
    rotation_speed: float
    ellipticity: float
    thickness: float = 0.2
    seed: int


class FitnessGalaxyGenome(BaseModel):
    genome: GalaxyGenomeParams
    fitness: float


class GalaxyEvolutionRequest(BaseModel):
    population: List[FitnessGalaxyGenome]
    mutation_rate: float = 0.1
    elitism_count: int = 1


class PlanetGenomeParams(BaseModel):
    elevation_scale: float
    ocean_level: float
    mountain_sharpness: float
    crater_density: float
    ice_cap_coverage: float
    desert_threshold: float
    forest_density: float
    cloud_density: float
    frequency: float
    lacunarity: float
    persistence: float
    octaves: int
    seed: int
    atmosphere_thickness: float


class FitnessPlanetGenome(BaseModel):
    genome: PlanetGenomeParams
    fitness: float


class PlanetEvolutionRequest(BaseModel):
    population: List[FitnessPlanetGenome]
    mutation_rate: float = 0.1
    elitism_count: int = 1


def genome_to_dict(g):
    return {
        "frequency": g.frequency,
        "lacunarity": g.lacunarity,
        "persistence": g.persistence,
        "octaves": g.octaves,
        "seed": g.seed,
        "offset_x": g.offset_x,
        "offset_y": g.offset_y,
        "ridge_threshold": g.ridge_threshold,
        "turbulence": g.turbulence,
    }


def galaxy_genome_to_dict(g):
    return {
        "num_arms": g.num_arms,
        "arm_tightness": g.arm_tightness,
        "core_density": g.core_density,
        "arm_spread": g.arm_spread,
        "star_count": g.star_count,
        "color_temperature": g.color_temperature,
        "rotation_speed": g.rotation_speed,
        "ellipticity": g.ellipticity,
        "thickness": g.thickness,
        "seed": g.seed,
    }


def planet_genome_to_dict(g):
    return {
        "elevation_scale": g.elevation_scale,
        "ocean_level": g.ocean_level,
        "mountain_sharpness": g.mountain_sharpness,
        "crater_density": g.crater_density,
        "ice_cap_coverage": g.ice_cap_coverage,
        "desert_threshold": g.desert_threshold,
        "forest_density": g.forest_density,
        "cloud_density": g.cloud_density,
        "frequency": g.frequency,
        "lacunarity": g.lacunarity,
        "persistence": g.persistence,
        "octaves": g.octaves,
        "seed": g.seed,
        "atmosphere_thickness": g.atmosphere_thickness,
    }


# Include education router
app.include_router(education_router)


@app.get("/")
async def root():
    return {"message": "ProceduralGraph AI API", "status": "running"}


@app.get("/api/init-population")
async def init_population(count: int = 12):
    if not procedural_graph_core:
        raise HTTPException(status_code=500, detail="Rust core not available")

    population = []
    for _ in range(count):
        g = procedural_graph_core.Genome.random()
        population.append(genome_to_dict(g))

    return population


@app.post("/api/evolve")
async def evolve(req: EvolutionRequest):
    if not procedural_graph_core:
        raise HTTPException(status_code=500, detail="Rust core not available")

    # Convert request to Rust objects
    rust_pop = []
    for item in req.population:
        g = procedural_graph_core.Genome(
            item.genome.frequency,
            item.genome.lacunarity,
            item.genome.persistence,
            item.genome.octaves,
            item.genome.seed,
        )
        g.offset_x = item.genome.offset_x
        g.offset_y = item.genome.offset_y
        g.ridge_threshold = item.genome.ridge_threshold
        g.turbulence = item.genome.turbulence
        rust_pop.append((g, item.fitness))

    # Call Rust evolution
    new_rust_genomes = procedural_graph_core.evolve_population(
        rust_pop, req.mutation_rate, req.elitism_count
    )

    return [genome_to_dict(g) for g in new_rust_genomes]


@app.post("/api/generate-mesh")
async def generate_mesh(params: GenomeParams):
    if not procedural_graph_core:
        raise HTTPException(status_code=500, detail="Rust core not available")

    genome = procedural_graph_core.Genome(
        params.frequency,
        params.lacunarity,
        params.persistence,
        params.octaves,
        params.seed,
    )
    genome.offset_x = params.offset_x
    genome.offset_y = params.offset_y
    genome.ridge_threshold = params.ridge_threshold
    genome.turbulence = params.turbulence

    # Generate 40x40 mesh for better quality
    mesh = procedural_graph_core.generate_mesh(genome, 40, 40, 12.0)

    return {"vertices": mesh.vertices, "indices": mesh.indices}


@app.post("/api/export-obj")
async def export_obj(params: GenomeParams):
    if not procedural_graph_core:
        raise HTTPException(status_code=500, detail="Rust core not available")

    genome = procedural_graph_core.Genome(
        params.frequency,
        params.lacunarity,
        params.persistence,
        params.octaves,
        params.seed,
    )
    genome.offset_x = params.offset_x
    genome.offset_y = params.offset_y
    genome.ridge_threshold = params.ridge_threshold
    genome.turbulence = params.turbulence

    mesh = procedural_graph_core.generate_mesh(
        genome, 100, 100, 20.0
    )  # Higher res for export
    obj_data = mesh.to_obj()

    from fastapi.responses import Response

    return Response(
        content=obj_data,
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename=mesh_{params.seed}.obj"},
    )


@app.get("/api/init-galaxy-population")
async def init_galaxy_population(count: int = 12):
    if not procedural_graph_core:
        raise HTTPException(status_code=500, detail="Rust core not available")

    population = []
    for _ in range(count):
        g = procedural_graph_core.GalaxyGenome.random()
        population.append(galaxy_genome_to_dict(g))

    return population


@app.post("/api/evolve-galaxy")
async def evolve_galaxy(req: GalaxyEvolutionRequest):
    if not procedural_graph_core:
        raise HTTPException(status_code=500, detail="Rust core not available")

    rust_pop = []
    for item in req.population:
        g = procedural_graph_core.GalaxyGenome(
            item.genome.num_arms,
            item.genome.arm_tightness,
            item.genome.core_density,
            item.genome.arm_spread,
            item.genome.star_count,
            item.genome.color_temperature,
            item.genome.rotation_speed,
            item.genome.ellipticity,
            item.genome.seed,
        )
        g.thickness = item.genome.thickness
        rust_pop.append((g, item.fitness))

    new_rust_genomes = procedural_graph_core.evolve_galaxy_population(
        rust_pop, req.mutation_rate, req.elitism_count
    )

    return [galaxy_genome_to_dict(g) for g in new_rust_genomes]


@app.post("/api/generate-galaxy-points")
async def generate_galaxy_points(params: GalaxyGenomeParams):
    if not procedural_graph_core:
        raise HTTPException(status_code=500, detail="Rust core not available")

    genome = procedural_graph_core.GalaxyGenome(
        params.num_arms,
        params.arm_tightness,
        params.core_density,
        params.arm_spread,
        params.star_count,
        params.color_temperature,
        params.rotation_speed,
        params.ellipticity,
        params.seed,
    )
    genome.thickness = params.thickness

    points = procedural_graph_core.generate_galaxy_points(genome)

    return {
        "positions": points.positions,
        "colors": points.colors,
        "sizes": points.sizes,
    }


@app.get("/api/init-planet-population")
async def init_planet_population(count: int = 12):
    if not procedural_graph_core:
        raise HTTPException(status_code=500, detail="Rust core not available")

    population = []
    for _ in range(count):
        g = procedural_graph_core.PlanetGenome.random()
        population.append(planet_genome_to_dict(g))

    return population


@app.post("/api/evolve-planet")
async def evolve_planet(req: PlanetEvolutionRequest):
    if not procedural_graph_core:
        raise HTTPException(status_code=500, detail="Rust core not available")

    rust_pop = []
    for item in req.population:
        g = procedural_graph_core.PlanetGenome(
            item.genome.elevation_scale,
            item.genome.ocean_level,
            item.genome.mountain_sharpness,
            item.genome.crater_density,
            item.genome.ice_cap_coverage,
            item.genome.desert_threshold,
            item.genome.forest_density,
            item.genome.cloud_density,
            item.genome.frequency,
            item.genome.lacunarity,
            item.genome.persistence,
            item.genome.octaves,
            item.genome.seed,
            item.genome.atmosphere_thickness,
        )
        rust_pop.append((g, item.fitness))

    new_rust_genomes = procedural_graph_core.evolve_planet_population(
        rust_pop, req.mutation_rate, req.elitism_count
    )

    return [planet_genome_to_dict(g) for g in new_rust_genomes]


@app.post("/api/generate-planet-mesh")
async def generate_planet_mesh(params: PlanetGenomeParams, resolution: int = 64):
    if not procedural_graph_core:
        raise HTTPException(status_code=500, detail="Rust core not available")

    genome = procedural_graph_core.PlanetGenome(
        params.elevation_scale,
        params.ocean_level,
        params.mountain_sharpness,
        params.crater_density,
        params.ice_cap_coverage,
        params.desert_threshold,
        params.forest_density,
        params.cloud_density,
        params.frequency,
        params.lacunarity,
        params.persistence,
        params.octaves,
        params.seed,
        params.atmosphere_thickness,
    )

    mesh = procedural_graph_core.generate_sphere_mesh(genome, resolution)

    return {"vertices": mesh.vertices, "indices": mesh.indices}


@app.post("/api/export-planet-obj")
async def export_planet_obj(params: PlanetGenomeParams, resolution: int = 128):
    if not procedural_graph_core:
        raise HTTPException(status_code=500, detail="Rust core not available")

    genome = procedural_graph_core.PlanetGenome(
        params.elevation_scale,
        params.ocean_level,
        params.mountain_sharpness,
        params.crater_density,
        params.ice_cap_coverage,
        params.desert_threshold,
        params.forest_density,
        params.cloud_density,
        params.frequency,
        params.lacunarity,
        params.persistence,
        params.octaves,
        params.seed,
        params.atmosphere_thickness,
    )

    mesh = procedural_graph_core.generate_sphere_mesh(genome, resolution)
    obj_data = mesh.to_obj()

    from fastapi.responses import Response

    return Response(
        content=obj_data,
        media_type="text/plain",
        headers={
            "Content-Disposition": f"attachment; filename=planet_{params.seed}.obj"
        },
    )


# Catalog endpoints
CATALOG_DIR = Path(__file__).parent.parent.parent / "content" / "catalog"


@app.get("/api/catalog/galaxies")
async def get_galaxy_catalog():
    """Retorna lista de galaxias reales disponibles"""
    galaxies_dir = CATALOG_DIR / "galaxies"
    if not galaxies_dir.exists():
        raise HTTPException(
            status_code=500, detail="Galaxy catalog directory not found"
        )

    galaxies = []
    for json_file in galaxies_dir.glob("*.json"):
        try:
            with open(json_file, "r") as f:
                data = json.load(f)
                galaxies.append(
                    {
                        "id": data["id"],
                        "name": data["name"],
                        "type": data["type"],
                        "description": data.get("description", ""),
                        "physical_properties": data.get("physical_properties", {}),
                        "fun_facts": data.get("fun_facts", [])[
                            :2
                        ],  # Preview: first 2 facts
                    }
                )
        except (json.JSONDecodeError, KeyError) as e:
            print(f"Error reading {json_file}: {e}")
            continue

    return galaxies


@app.get("/api/catalog/galaxies/{galaxy_id}")
async def get_galaxy_detail(galaxy_id: str):
    """Retorna detalle completo de una galaxia específica"""
    galaxy_file = CATALOG_DIR / "galaxies" / f"{galaxy_id}.json"
    if not galaxy_file.exists():
        raise HTTPException(status_code=404, detail=f"Galaxy '{galaxy_id}' not found")

    try:
        with open(galaxy_file, "r") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Invalid JSON: {e}")


@app.get("/api/catalog/planets")
async def get_planet_catalog():
    """Retorna lista de planetas reales disponibles"""
    planets_dir = CATALOG_DIR / "planets"
    if not planets_dir.exists():
        raise HTTPException(
            status_code=500, detail="Planet catalog directory not found"
        )

    planets = []
    for json_file in planets_dir.glob("*.json"):
        try:
            with open(json_file, "r") as f:
                data = json.load(f)
                planets.append(
                    {
                        "id": data["id"],
                        "name": data["name"],
                        "type": data["type"],
                        "description": data.get("description", ""),
                        "physical_properties": data.get("physical_properties", {}),
                        "fun_facts": data.get("fun_facts", [])[
                            :2
                        ],  # Preview: first 2 facts
                    }
                )
        except (json.JSONDecodeError, KeyError) as e:
            print(f"Error reading {json_file}: {e}")
            continue

    return planets


@app.get("/api/catalog/planets/{planet_id}")
async def get_planet_detail(planet_id: str):
    """Retorna detalle completo de un planeta específico"""
    planet_file = CATALOG_DIR / "planets" / f"{planet_id}.json"
    if not planet_file.exists():
        raise HTTPException(status_code=404, detail=f"Planet '{planet_id}' not found")

    try:
        with open(planet_file, "r") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Invalid JSON: {e}")
