# API Reference

REST API endpoints for ProceduralGraph AI.

**Base URL:** `http://localhost:8000`

## Endpoints

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API status |
| `GET` | `/api/rust-test` | Verify Rust core |

### Galaxies

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/init-galaxy-population?count=12` | Random galaxy genomes |
| `POST` | `/api/generate-galaxy-points` | Generate star positions |
| `POST` | `/api/evolve-galaxy` | Evolve population |

### Planets

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/init-planet-population?count=12` | Random planet genomes |
| `POST` | `/api/generate-planet-mesh?resolution=64` | Generate spherical mesh |
| `POST` | `/api/evolve-planet` | Evolve population |
| `POST` | `/api/export-planet-obj?resolution=128` | Download OBJ file |

### Terrain/Meshes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/init-population?count=12` | Random terrain genomes |
| `POST` | `/api/generate-mesh` | Generate terrain mesh |
| `POST` | `/api/evolve` | Evolve population |
| `POST` | `/api/export-obj` | Download OBJ file |

## Data Models

### Galaxy Genome

```json
{
  "num_arms": 4,              // 1-8: Spiral arms
  "arm_tightness": 1.2,       // 0.1-2.0: Winding tightness
  "core_density": 0.6,        // 0.0-1.0: Stars in center
  "arm_spread": 0.4,          // 0.1-1.0: Star dispersion
  "star_count": 50000,        // 10000-100000: Total stars
  "color_temperature": 6500,  // 2000-10000: Kelvin
  "rotation_speed": 0.3,      // 0.0-1.0
  "ellipticity": 0.2,         // 0.0-1.0: Flattening
  "thickness": 0.2,           // 0.05-0.5: Disk thickness
  "seed": 12345
}
```

### Planet Genome

```json
{
  "elevation_scale": 0.7,      // 0.0-1.0: Max height
  "ocean_level": 0.4,          // 0.0-1.0: Sea level
  "mountain_sharpness": 1.5,   // 0.1-2.0: Steepness
  "crater_density": 0.3,       // 0.0-1.0
  "ice_cap_coverage": 0.2,     // 0.0-1.0: Polar ice
  "desert_threshold": 0.6,     // 0.0-1.0
  "forest_density": 0.5,       // 0.0-1.0
  "cloud_density": 0.4,        // 0.0-1.0
  "frequency": 0.01,           // 0.001-1.0: Noise frequency
  "lacunarity": 2.0,           // 1.0-4.0: Octave multiplier
  "persistence": 0.5,          // 0.0-1.0: Amplitude decay
  "octaves": 4,                // 1-8: Noise layers
  "seed": 12345,
  "atmosphere_thickness": 0.5  // 0.0-1.0
}
```

### Evolution Request

```json
{
  "population": [
    {
      "genome": { /* Genome params */ },
      "fitness": 0.85  // 0.0-1.0
    }
  ],
  "mutation_rate": 0.1,  // 0.0-1.0
  "elitism_count": 2     // Preserve top N
}
```

### Galaxy Points Response

```json
{
  "positions": [x1, y1, z1, x2, y2, z2, ...],
  "colors": [r1, g1, b1, r2, g2, b2, ...],
  "sizes": [size1, size2, ...]
}
```

### Mesh Response

```json
{
  "vertices": [x1, y1, z1, x2, y2, z2, ...],
  "indices": [i1, i2, i3, ...]
}
```

## Examples

### Initialize Galaxy Population

```bash
curl "http://localhost:8000/api/init-galaxy-population?count=6"
```

### Generate Galaxy Points

```bash
curl -X POST http://localhost:8000/api/generate-galaxy-points \
  -H "Content-Type: application/json" \
  -d '{
    "num_arms": 4,
    "arm_tightness": 1.2,
    "core_density": 0.6,
    "arm_spread": 0.4,
    "star_count": 50000,
    "color_temperature": 6500,
    "rotation_speed": 0.3,
    "ellipticity": 0.2,
    "thickness": 0.2,
    "seed": 12345
  }'
```

### Evolve Population

```bash
curl -X POST http://localhost:8000/api/evolve-galaxy \
  -H "Content-Type: application/json" \
  -d '{
    "population": [
      {"genome": {...}, "fitness": 0.9},
      {"genome": {...}, "fitness": 0.7}
    ],
    "mutation_rate": 0.1,
    "elitism_count": 2
  }'
```

### Export Planet as OBJ

```bash
curl -X POST "http://localhost:8000/api/export-planet-obj?resolution=128" \
  -H "Content-Type: application/json" \
  -d '{"elevation_scale": 0.7, "ocean_level": 0.4, ...}' \
  --output planet.obj
```

## Error Responses

**500 Internal Server Error:**
```json
{"detail": "Rust core not available"}
```
*Solution: Run `maturin develop --release` in rust_core/*

**422 Unprocessable Entity:**
Invalid parameters or missing required fields.
