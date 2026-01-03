from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "running"


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_rust_integration():
    response = client.get("/api/rust-test")
    assert response.status_code == 200
    data = response.json()
    assert data["rust_available"] is True
    assert data["test_result"] == "30"
