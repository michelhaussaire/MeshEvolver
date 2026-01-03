from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="ProceduralGraph AI",
    description="Backend API for procedural mesh generation with Rust core",
    version="0.1.0",
)

# CORS para el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "ProceduralGraph AI API", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/api/rust-test")
async def rust_test():
    """Test endpoint to verify Rust bindings are working"""
    try:
        import procedural_graph_core

        result = procedural_graph_core.sum_as_string(10, 20)
        return {"rust_available": True, "test_result": result}
    except ImportError:
        return {"rust_available": False, "error": "Rust module not found"}
