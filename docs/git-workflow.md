# Flujo de Trabajo Git - CosmosLearn

## Estructura de Branches

- `main`: Código estable y probado
- `develop`: Integración de features (opcional para MVP)
- `feature/CL-NNN-*`: Branches de características
- `hotfix/*`: Correcciones urgentes en producción

## Convención de Nombres

- Features: `feature/CL-NNN-descripcion-corta`
- Hotfixes: `hotfix/descripcion-del-bug`
- Commits: "CL-NNN: Descripción del cambio"

## Flujo de Desarrollo

1. Crear branch desde main: `git checkout -b feature/CL-NNN-descripcion`
2. Desarrollar feature
3. Hacer commits con mensajes descriptivos
4. Crear Pull Request a main
5. Code Review por QA Reviewer
6. Merge después de aprobación

## Branches Actuales

| Branch | Descripción | Estado |
|--------|-------------|--------|
| feature/CL-001-algorithm-registry-rust | Registro de algoritmos en Rust | Ready |
| feature/CL-002-educational-content-api | API de contenido educativo | Ready |
| feature/CL-003-dual-explanation-ui | UI de explicaciones duales | Ready |
| feature/CL-004-challenge-system | Sistema de desafíos | Ready |
| feature/CL-005-real-objects-catalog | Catálogo de objetos reales | Ready |
| feature/CL-006-ocean-shaders | Shaders de océanos | Ready |
| feature/CL-007-vegetation-system | Sistema de vegetación | Ready |
| feature/CL-008-discovery-mode | Modo descubrimiento | Ready |
