// Fractal Brownian Motion (FBM) GLSL Shader
// Combina múltiples octavas de ruido para crear detalles a diferentes escalas
// Usado para terrenos, nubes, texturas naturales

// FBM usando Perlin noise
// Lacunarity: espaciado entre octavas (típicamente 2.0)
// Gain: atenuación de amplitud por octava (típicamente 0.5)

// Importar función perlin desde perlin.glsl
// #pragma glslify: perlin = require(./perlin.glsl)

// FBM basado en ruido genérico
float fbm(
  vec3 x,
  int octaves,
  float lacunarity,
  float gain,
  float noiseFunc(vec3)
) {
  float total = 0.0;
  float frequency = 1.0;
  float amplitude = 1.0;
  float maxValue = 0.0;  // Used for normalizing result to 0.0 - 1.0

  for(int i = 0; i < 6; i++) {
    if(i >= octaves) break;
    
    total += noiseFunc(x * frequency) * amplitude;
    
    maxValue += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }

  return total / maxValue;
}

// FBM Turbulence - usa valor absoluto del ruido
float turbulence(
  vec3 x,
  int octaves,
  float lacunarity,
  float gain,
  float noiseFunc(vec3)
) {
  float total = 0.0;
  float frequency = 1.0;
  float amplitude = 1.0;
  float maxValue = 0.0;

  for(int i = 0; i < 6; i++) {
    if(i >= octaves) break;
    
    total += abs(noiseFunc(x * frequency)) * amplitude;
    
    maxValue += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }

  return total / maxValue;
}

// FBM Ridged - crea crestas
float ridged(
  vec3 x,
  int octaves,
  float lacunarity,
  float gain,
  float noiseFunc(vec3)
) {
  float total = 0.0;
  float frequency = 1.0;
  float amplitude = 1.0;
  float maxValue = 0.0;

  for(int i = 0; i < 6; i++) {
    if(i >= octaves) break;
    
    float n = 1.0 - abs(noiseFunc(x * frequency));
    total += n * n * amplitude;
    
    maxValue += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }

  return total / maxValue;
}
