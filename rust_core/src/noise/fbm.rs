//! Fractal Brownian Motion (FBM)
//!
//! Combina múltiples octavas de ruido para crear detalles a diferentes escalas.
//! Usado para terrenos naturales, nubes, texturas orgánicas.

use crate::noise::perlin::perlin3d;
use crate::noise::simplex::simplex3d;
use pyo3::prelude::*;

/// Tipo de función de ruido
pub enum NoiseFunction {
    Perlin,
    Simplex,
}

/// FBM usando la función de ruido especificada
///
/// # Arguments
/// * `x`, `y`, `z` - Coordenadas de entrada
/// * `octaves` - Número de octavas (capas) de ruido
/// * `lacunarity` - Factor de espaciado entre octavas (típicamente 2.0)
/// * `gain` - Atenuación de amplitud por octava (típicamente 0.5)
/// * `noise_func` - Función de ruido base a usar
pub fn fbm(
    x: f64,
    y: f64,
    z: f64,
    octaves: u32,
    lacunarity: f64,
    gain: f64,
    noise_func: &NoiseFunction,
) -> f64 {
    let mut total = 0.0;
    let mut frequency = 1.0;
    let mut amplitude = 1.0;
    let mut max_value = 0.0;

    for _ in 0..octaves {
        let sample = match noise_func {
            NoiseFunction::Perlin => perlin3d(x * frequency, y * frequency, z * frequency),
            NoiseFunction::Simplex => simplex3d(x * frequency, y * frequency, z * frequency),
        };

        total += sample * amplitude;
        max_value += amplitude;
        amplitude *= gain;
        frequency *= lacunarity;
    }

    total / max_value
}

/// FBM Turbulence - usa valor absoluto del ruido
/// Crea patrones más contrastados
pub fn turbulence(
    x: f64,
    y: f64,
    z: f64,
    octaves: u32,
    lacunarity: f64,
    gain: f64,
    noise_func: &NoiseFunction,
) -> f64 {
    let mut total = 0.0;
    let mut frequency = 1.0;
    let mut amplitude = 1.0;
    let mut max_value = 0.0;

    for _ in 0..octaves {
        let sample = match noise_func {
            NoiseFunction::Perlin => perlin3d(x * frequency, y * frequency, z * frequency),
            NoiseFunction::Simplex => simplex3d(x * frequency, y * frequency, z * frequency),
        };

        total += sample.abs() * amplitude;
        max_value += amplitude;
        amplitude *= gain;
        frequency *= lacunarity;
    }

    total / max_value
}

/// FBM Ridged - crea crestas y valles pronunciados
/// Ideal para montañas y cordilleras
pub fn ridged(
    x: f64,
    y: f64,
    z: f64,
    octaves: u32,
    lacunarity: f64,
    gain: f64,
    noise_func: &NoiseFunction,
) -> f64 {
    let mut total = 0.0;
    let mut frequency = 1.0;
    let mut amplitude = 1.0;
    let mut max_value = 0.0;

    for _ in 0..octaves {
        let sample = match noise_func {
            NoiseFunction::Perlin => perlin3d(x * frequency, y * frequency, z * frequency),
            NoiseFunction::Simplex => simplex3d(x * frequency, y * frequency, z * frequency),
        };

        // Ridge: 1 - |noise|
        let n = 1.0 - sample.abs();
        total += n * n * amplitude;
        max_value += amplitude;
        amplitude *= gain;
        frequency *= lacunarity;
    }

    total / max_value
}

/// Python-exposed FBM with Perlin
#[pyfunction]
pub fn py_fbm_perlin(x: f64, y: f64, z: f64, octaves: u32, lacunarity: f64, gain: f64) -> f64 {
    fbm(x, y, z, octaves, lacunarity, gain, &NoiseFunction::Perlin)
}

/// Python-exposed FBM with Simplex
#[pyfunction]
pub fn py_fbm_simplex(x: f64, y: f64, z: f64, octaves: u32, lacunarity: f64, gain: f64) -> f64 {
    fbm(x, y, z, octaves, lacunarity, gain, &NoiseFunction::Simplex)
}
