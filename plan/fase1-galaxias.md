# Fase 1: Macro-Cosmos (Galaxias)

## Objetivo
Implementar la generación procedural de galaxias utilizando algoritmos de ondas de densidad y sistemas de partículas, permitiendo la evolución genética de estructuras galácticas.

## Tareas Detalladas

### 1.1 Diseño del GalaxyGenome en Rust
- [ ] Definir la estructura `GalaxyGenome` en `rust_core/src/lib.rs`
- [ ] Añadir parámetros:
  - `num_arms`: número de brazos espirales (1-8)
  - `arm_tightness`: qué tan juntos están los brazos (0.1-2.0)
  - `core_density`: densidad de estrellas en el núcleo (0.0-1.0)
  - `arm_spread`: dispersión de estrellas por brazo (0.1-1.0)
  - `star_count`: número total de estrellas (10000-100000)
  - `color_temperature`: temperatura base del color (2000-10000 K)
  - `rotation_speed`: velocidad de rotación (0.0-1.0)
  - `ellipticity`: grado de aplanamiento (0.0-1.0)
- [ ] Implementar constructor `GalaxyGenome::random()` con rangos realistas
- [ ] Implementar getters y setters para PyO3

### 1.2 Algoritmo de Distribución de Brazos Espirales
- [ ] Implementar función `generate_galaxy_positions(genome: &GalaxyGenome) -> GalaxyPoints`
- [ ] Usar la fórmula de espiral logarítmica: `r = a * e^(b * theta)`
- [ ] Aplicar offset angular aleatorio por brazo para dispersión natural
- [ ] Añadir ruido de Perlin a las posiciones de estrellas para irregularidades
- [ ] Implementar densidad decreciente desde el núcleo hacia afuera

### 1.3 Generación de Colores Espectrales
- [ ] Implementar función `star_color_from_temperature(temp: f64) -> (r, g, b)`
- [ ] Basarse en la ley de Planck para temperatura-color
- [ ] Temperaturas bajas (~3000K) → rojo/naranja
- [ ] Temperaturas medias (~6000K) → blanco/amarillo
- [ ] Temperaturas altas (~10000K+) → azul/ultravioleta
- [ ] Añadir variación aleatoria de color para cada estrella

### 1.4 Estructura de Datos para Nube de Puntos
- [ ] Definir `struct GalaxyPoints`
- [ ] Campos: `positions: Vec<f64>`, `colors: Vec<f64>`, `sizes: Vec<f64>`
- [ ] Implementar exportación a formato JSON optimizado
- [ ] Añadir método `to_json() -> String`

### 1.5 Integración con PyO3
- [ ] Exponer `GalaxyGenome` como clase Python
- [ ] Exponer `generate_galaxy_positions()` como función Python
- [ ] Compilar y actualizar `procedural_graph_core.so`
- [ ] Verificar importación desde Python

### 1.6 Backend API Endpoints
- [ ] Añadir endpoint `/api/init-galaxy-population`
- [ ] Parámetros: `count: int = 12`
- [ ] Añadir endpoint `/api/evolve-galaxy`
- [ ] Añadir endpoint `/api/generate-galaxy-points`
- [ ] Actualizar modelos Pydantic en `backend/src/main.py`
- [ ] Implementar lógica de crossover y mutación específica para galaxias

### 1.7 Frontend: Sistema de Partículas Three.js
- [ ] Instalar dependencias si es necesario: `npm install @react-three/fiber`
- [ ] Crear componente `GalaxyViewer.tsx`
- [ ] Usar `THREE.Points` para renderizar estrellas
- [ ] Implementar `THREE.BufferGeometry` con posiciones y colores
- [ ] Usar `THREE.PointsMaterial` con `vertexColors: true`
- [ ] Añadir shader personalizado para tamaño variable de estrellas
- [ ] Optimizar con `THREE.PointsMaterial.sizeAttenuation`

### 1.8 Frontend: Cámara y Controles
- [ ] Configurar `OrbitControls` para rotación y zoom
- [ ] Ajustar distancias de cámara (min: 10, max: 500)
- [ ] Implementar auto-rotación suave opcional
- [ ] Añadir control de velocidad de rotación en UI

### 1.9 Frontend: Interfaz de Selección
- [ ] Crear galería de miniaturas para población de galaxias
- [ ] Implementar click para seleccionar galaxia
- [ ] Mostrar vista previa al hacer hover
- [ ] Añadir botón "Evolucionar" para generar siguiente generación
- [ ] Mostrar parámetros del genoma actual (número de brazos, temperatura, etc.)

### 1.10 Frontend: Efectos Visuales
- [ ] Implementar post-processing de Bloom con `@react-three/postprocessing`
- [ ] Añadir `EffectComposer` y `UnrealBloomPass`
- [ ] Configurar brillo del núcleo galáctico
- [ ] Añadir fade-in suave al cargar nueva galaxia

### 1.11 Pruebas y Validación
- [ ] Probar generación de galaxias con parámetros extremos
- [ ] Verificar que brazos espirales son visibles
- [ ] Comprobar que no hay colisiones de estrellas en núcleo
- [ ] Medir FPS con 100,000 partículas
- [ ] Validar evolución genética produce variaciones interesantes

### 1.12 Documentación
- [ ] Actualizar `readme.md` con instrucciones de galaxias
- [ ] Crear archivo `GALAXY_GUIDE.md` explicando algoritmos
- [ ] Documentar parámetros del `GalaxyGenome`
- [ ] Añadir ejemplos de parámetros para tipos de galaxias (Espiral, Barrada, Elíptica)

## Entregables
- [ ] Galaxias generadas con brazos espirales visibles
- [ ] Colores espectrales basados en temperatura
- [ ] Interfaz de evolución genética funcional
- [ ] Sistema de partículas optimizado para 100,000+ estrellas
- [ ] Efectos de bloom para realismo visual
