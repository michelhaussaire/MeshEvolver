from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sys
import os
import random

# Ensure the shared library is findable
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    import procedural_graph_core
except ImportError:
    procedural_graph_core = None

app = FastAPI(
    title="ProceduralGraph AI",
    description="Backend API for procedural mesh generation with Rust core",
    version="0.1.0",
)

# CORS para el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Simplified for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenomeParams(BaseModel):
    frequency: float
    lacunarity: float
    persistence: float
    octaves: int
    seed: int
    offset_x: float = 0.0
    offset_y: float = 0.0

class FitnessGenome(BaseModel):
    genome: GenomeParams
    fitness: float

class EvolutionRequest(BaseModel):
    population: List[FitnessGenome]
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
        "offset_y": g.offset_y
    }

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
            item.genome.seed
        )
        g.offset_x = item.genome.offset_x
        g.offset_y = item.genome.offset_y
        rust_pop.append((g, item.fitness))
    
    # Call Rust evolution
    new_rust_genomes = procedural_graph_core.evolve_population(
        rust_pop, 
        req.mutation_rate, 
        req.elitism_count
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
        params.seed
    )
    genome.offset_x = params.offset_x
    genome.offset_y = params.offset_y
    
    # Generate 40x40 mesh for better quality
    mesh = procedural_graph_core.generate_mesh(genome, 40, 40, 8.0)
    
    return {
        "vertices": mesh.vertices,
        "indices": mesh.indices
    }
