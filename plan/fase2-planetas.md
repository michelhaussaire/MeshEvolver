# Fase 2: Micro-Cosmos (Planetas)

## Objetivo
Implementar la generación procedural de planetas con texturas y topografía evolucionables, permitiendo zoom desde galaxia hasta superficie planetaria.

## Tareas Detalladas

### 2.1 Diseño del PlanetGenome en Rust
- [ ] Definir la estructura `PlanetGenome` en `rust_core/src/lib.rs`
- [ ] Añadir parámetros topográficos:
  - `elevation_scale`: altura máxima del terreno (0.0-1.0)
  - `ocean_level`: porcentaje de superficie cubierta por agua (0.0-1.0)
  - `mountain_sharpness`: qué picudas son las montañas (0.1-2.0)
  - `crater_density`: densidad de cráteres (0.0-1.0)
  - `ice_cap_coverage`: cobertura de hielo en polos (0.0-1.0)
- [ ] Añadir parámetros de biomas:
  - `desert_threshold`: umbral para desierto (0.0-1.0)
  - `forest_density`: densidad de vegetación (0.0-1.0)
  - `cloud_density`: densidad de nubes (0.0-1.0)
- [ ] Reutilizar parámetros de ruido existentes (`frequency`, `lacunarity`, `persistence`, `octaves`)

### 2.2 Implementación de Esferificación
- [ ] Crear función `generate_sphere_mesh(genome: &PlanetGenome, resolution: usize) -> Mesh`
- [ ] Usar "Spherified Cube" en lugar de UV Sphere para evitar distorsión polar
- [ ] Algoritmo:
  1. Generar grid 2D de ruido (cuadrado de resolución x resolución)
  2. Mapear cada punto a un cubo normalizado (-1 a 1 en x,y,z)
  3. Proyectar cada punto del cubo a la esfera unitaria
  4. Aplicar elevación basada en ruido
- [ ] Asegurar distribución uniforme de vértices
- [ ] Manejar bordes del cubo para continuidad de textura

### 2.3 Generación de Cráteres Procedurales
- [ ] Implementar función `add_craters(mesh: &mut Mesh, count: usize, min_radius: f64, max_radius: f64)`
- [ ] Usar distribución aleatoria ponderada por latitud (más cráteres en ecuador)
- [ ] Aplicar depresión gaussiana para forma de cráter
- [ ] Añadir elevación en bordes (borde de cráter)
- [ ] Variar profundidad basado en radio

### 2.4 Generación de Biomas
- [ ] Implementar función `generate_biome_mask(elevation: f64, moisture: f64, temperature: f64) -> BiomeType`
- [ ] Tipos de biomas:
  - `Ice`: polos con hielo
  - `Tundra`: altitudes medias con temperatura baja
  - `Desert`: baja humedad, temperatura alta
  - `Grassland`: humedad media, temperatura media
  - `Forest`: alta humedad, temperatura media
  - `Jungle`: muy alta humedad, temperatura alta
- [ ] Mapear biomas a colores RGB
- [ ] Añadir transición suave entre biomas (interpolación)

### 2.5 Texturización de Nubes
- [ ] Generar capa de nubes separada con otro ruido Perlin
- [ ] Añadir transparencia variable (alpha channel)
- [ ] Implementar movimiento de nubes basado en latitud
- [ ] Optimizar: usar texturas de baja resolución (512x512)

### 2.6 Iluminación y Sombreado
- [ ] Implementar normales por vértice en `Mesh`
- [ ] Calcular normales usando producto cruz de triángulos adyacentes
- [ ] Añadir parámetro `atmosphere_thickness` al genoma
- [ ] Implementar efecto de dispersión atmosférica (rayo azul más dispersado)
- [ ] Añadir "terminator line" (línea día/noche) gradual

### 2.7 Integración con PyO3
- [ ] Exponer `PlanetGenome` como clase Python
- [ ] Exponer `generate_sphere_mesh()` modificado para planetas
- [ ] Compilar y actualizar `procedural_graph_core.so`
- [ ] Verificar generación de esferas con diferentes resoluciones

### 2.8 Backend API Endpoints
- [ ] Añadir endpoint `/api/init-planet-population`
- [ ] Añadir endpoint `/api/evolve-planet`
- [ ] Añadir endpoint `/api/generate-planet-mesh`
- [ ] Añadir endpoint `/api/export-planet-obj`
- [ ] Actualizar modelos Pydantic con parámetros planetarios
- [ ] Implementar crossover y mutación para planetas

### 2.9 Frontend: Renderizado de Planetas
- [ ] Crear componente `PlanetViewer.tsx`
- [ ] Usar `THREE.MeshStandardMaterial` con `vertexColors: true`
- [ ] Implementar iluminación direccional (sol)
- [ ] Añadir luz ambiental suave
- [ ] Configurar sombras en `renderer`

### 2.10 Frontend: Animación de Rotación
- [ ] Implementar rotación suave del planeta
- [ ] Añadir control de velocidad de rotación
- [ ] Permitir arrastrar con mouse para rotar manualmente
- [ ] Añadir inercia al arrastrar

### 2.11 Frontend: Navegación Escalar
- [ ] Implementar transición de cámara entre vista galáctica y planetaria
- [ ] Usar GSAP o biblioteca de tweening para animación suave
- [ ] Añadir botón "Zoom to Planet" en vista galáctica
- [ ] Añadir botón "Back to Galaxy" en vista planetaria
- [ ] Calcular posición de planeta en vista galáctica para zoom apropiado

### 2.12 Frontend: Interfaz de Parámetros Planetarios
- [ ] Crear panel de controles deslizable
- [ ] Sliders para: nivel del océano, altura de montañas, densidad de cráteres
- [ ] Checkbox para mostrar/ocultar nubes
- [ ] Checkbox para mostrar/ocultar atmósfera
- [ ] Selector de calidad de malla (Baja: 32, Media: 64, Alta: 128)

### 2.13 Frontend: Comparación de Generaciones
- [ ] Permitir visualizar múltiples planetas simultáneamente
- [ ] Grid de 4 planetas (2x2) para comparar
- [ ] Cada planeta rotando a diferente velocidad
- [ ] Click para seleccionar y ver detalles

### 2.14 Optimización de Performance
- [ ] Implementar LOD (Level of Detail) dinámico
  - Lejos: malla de 32 segmentos
  - Medio: malla de 64 segmentos
  - Cerca: malla de 128 segmentos
- [ ] Usar instanced rendering para cráteres repetidos
- [ ] Comprimir texturas con formatos optimizados

### 2.15 Pruebas y Validación
- [ ] Probar planetas con 100% agua (mundos oceánicos)
- [ ] Probar planetas con 0% agua (mundos desérticos)
- [ ] Verificar que biomas se distribuyen lógicamente
- [ ] Comprobar que no hay distorsión en polos
- [ ] Medir FPS con malla de alta resolución

### 2.16 Documentación
- [ ] Crear archivo `PLANET_GUIDE.md` explicando algoritmo de esferificación
- [ ] Documentar parámetros del `PlanetGenome`
- [ ] Añadir ejemplos de parámetros para tipos de planetas:
  - Terran (tipo Tierra)
  - Desert (tipo Marte)
  - Ice (tipo Europa)
  - Gas Giant (tipo Júpiter)
- [ ] Crear guía de optimización de performance

## Entregables
- [ ] Planetas con topografía generada proceduralmente
- [ ] Sistema de biomas funcional con colores apropiados
- [ ] Capa de nubes animada y translúcida
- [ ] Navegación fluida entre vista galáctica y planetaria
- [ ] Panel de control para ajustar parámetros en tiempo real
- [ ] LOD dinámico para mantener 60 FPS
