# Architecture

System architecture and component design.

## Overview

ProceduralGraph AI uses a three-tier architecture:

```mermaid
flowchart TB
    subgraph Client["💻 Client"]
        React["React + Three.js<br/>UI & Rendering"]
    end
    
    subgraph Server["🖥️ Server"]
        FastAPI["FastAPI<br/>REST API"]
    end
    
    subgraph Core["⚙️ Compute Core"]
        Rust["Rust + PyO3<br/>Procedural Generation"]
    end
    
    subgraph Storage["💾 Cache (Future)"]
        Redis["Redis<br/>SHA-256 Hash Cache"]
    end
    
    React <-->|HTTP REST| FastAPI
    FastAPI <-->|PyO3 Bindings| Rust
    FastAPI -.->|Binary Blobs| Redis
```

## Data Flow

### Galaxy Generation Flow

```mermaid
sequenceDiagram
    participant UI as React UI
    participant API as FastAPI
    participant Rust as Rust Core
    
    UI->>API: POST /api/generate-galaxy-points
    API->>Rust: GalaxyGenome params
    Rust->>Rust: Generate spiral distribution
    Rust->>Rust: Calculate stellar colors
    Rust-->>API: GalaxyPoints {positions, colors, sizes}
    API-->>UI: JSON response
    UI->>UI: Render with THREE.Points
```

### Evolution Flow

```mermaid
sequenceDiagram
    participant User as User
    participant UI as Frontend
    participant API as Backend
    participant Rust as Rust Core
    
    User->>UI: Rate genomes (fitness scores)
    UI->>API: POST /api/evolve-{type}
    API->>Rust: Population + fitness
    Rust->>Rust: Tournament selection
    Rust->>Rust: Crossover
    Rust->>Rust: Mutation
    Rust-->>API: New population
    API-->>UI: Evolved genomes
    UI->>User: Display new generation
```

## Rust Core

### Module Structure

```rust
// Genome Types
struct Genome { /* terrain parameters */ }
struct PlanetGenome { /* planet parameters */ }
struct GalaxyGenome { /* galaxy parameters */ }

// Generation Functions
fn generate_texture() -> Texture
fn generate_mesh() -> Mesh
fn generate_sphere_mesh() -> Mesh
fn generate_galaxy_points() -> GalaxyPoints

// Evolution Functions
fn evolve_population() -> Vec<Genome>
fn evolve_galaxy_population() -> Vec<GalaxyGenome>
fn evolve_planet_population() -> Vec<PlanetGenome>
```

### Key Algorithms

#### Galaxy Generation

1. **Spiral Distribution**: Logarithmic spiral formula
   ```
   r = distance_ratio * max_radius
   θ = (r * arm_tightness) + (arm_index * 2π/arm_count)
   ```

2. **Perlin Noise Perturbation**: Adds irregularities to arm positions

3. **Stellar Temperature → Color**: Based on black-body radiation physics

#### Genetic Algorithm

```mermaid
flowchart LR
    A[Population] --> B{Selection}
    B -->|Tournament| C[Parents]
    C --> D[Crossover]
    D --> E[Mutation]
    E --> F[New Generation]
    F --> A
```

**Selection**: Tournament (pick 3 random, take best)

**Crossover**: Uniform (50% chance per gene from either parent)

**Mutation**: Gaussian noise with clamping

## Frontend

### Component Hierarchy

```
App.tsx
├── GalaxyApp.tsx (galaxy-specific UI)
│   └── Scene.tsx (Three.js rendering)
└── App.tsx (main terrain UI)
    └── Scene.tsx
```

### State Flow

```mermaid
stateDiagram-v2
    [*] --> Initialize: Load population
    Initialize --> Viewing: Select genome
    Viewing --> Evolving: Assign fitness
    Evolving --> Viewing: New generation
    Viewing --> Exporting: Download OBJ
    Exporting --> Viewing
```

## PyO3 Integration

Rust types exposed to Python:

```rust
#[pymodule]
fn procedural_graph_core(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_class::<Genome>()?;
    m.add_class::<GalaxyGenome>()?;
    m.add_class::<PlanetGenome>()?;
    m.add_class::<Texture>()?;
    m.add_class::<Mesh>()?;
    m.add_class::<GalaxyPoints>()?;
    m.add_function(wrap_pyfunction!(generate_texture, m)?)?;
    m.add_function(wrap_pyfunction!(generate_mesh, m)?)?;
    m.add_function(wrap_pyfunction!(evolve_population, m)?)?;
    // ... more functions
    Ok(())
}
```

## Performance Considerations

- **Rust Core**: Memory-safe, zero-cost abstractions
- **Perlin Noise**: O(n) complexity for n octaves
- **Galaxy Generation**: O(star_count) - optimized with Vec::with_capacity()
- **Evolution**: O(population_size × tournament_size)

## Future Architecture (Q3 2025)

```mermaid
flowchart TB
    subgraph Browser["🌐 Browser"]
        React["React + Three.js"]
        subgraph WebWorker["Web Worker"]
            WASM["WASM<br/>Rust Core"]
        end
    end
    
    subgraph Server["☁️ Server"]
        FastAPI["FastAPI<br/>Validation Only"]
        Postgres[(PostgreSQL)]
    end
    
    React <-->|Main Thread| WebWorker
    WASM <-->|Generate| React
    React -.->|Save/Load| FastAPI
    FastAPI <-->|Persist| Postgres
```

Client-side generation via WebAssembly will eliminate server compute costs.
