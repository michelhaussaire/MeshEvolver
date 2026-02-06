# ProceduralGraph AI

Motor de generación procedural de alto rendimiento para crear y evolucionar avatares 3D/2D.

**Stack:** React + Three.js | FastAPI | Rust (PyO3)

## 🚀 Quick Start

```bash
# 1. Build Rust core
cd rust_core && maturin develop --release

# 2. Start backend
cd backend && uvicorn src.main:app --reload --port 8000

# 3. Start frontend
cd frontend && npm run dev
```

## 📚 Documentation

- **[Architecture](docs/architecture.md)** - System design & data flow
- **[API Reference](docs/api.md)** - REST endpoints
- **[Development](docs/development.md)** - Setup & troubleshooting  
- **[Roadmap](ROADMAP.md)** - Q1-Q4 milestones

## 🎯 Features

- 🌌 **Galaxy Generation** - Logarithmic spirals with 100K+ stars
- 🪐 **Planet Generation** - Spherical terrain with biomes
- 🧬 **Genetic Evolution** - Tournament selection + crossover + mutation

## 📦 Project Structure

```
MeshEvolver/
├── backend/           # FastAPI REST API
├── frontend/          # React + Three.js
├── rust_core/         # Rust + PyO3
├── docs/              # Documentation
├── readme.md          # This file
└── ROADMAP.md         # Development roadmap
```

## License

MIT
