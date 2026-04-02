//! Crossover Operations
//!
//! Operadores de cruce para combinar genomas.

use crate::genomes::Genome;

/// Cruce de un punto
///
/// Combina dos genomas en un punto específico.
pub fn single_point_crossover<T: Genome>(parent1: &T, parent2: &T, point: f64) -> T {
    parent1.crossover(parent2, point)
}

/// Cruce uniforme
///
/// Mezcla genes de ambos padres aleatoriamente.
pub fn uniform_crossover<T: Genome>(parent1: &T, parent2: &T, mix_ratio: f64) -> T {
    parent1.crossover(parent2, mix_ratio)
}

/// Cruce BLX-alpha (Blend Crossover)
///
/// Crea descendencia en el rango expandido de los padres.
pub fn blx_alpha_crossover<T: Genome>(parent1: &T, parent2: &T, alpha: f64) -> T
where
    T: Blendable,
{
    parent1.blend(parent2, alpha)
}

/// Trait para genomas que soportan blending
pub trait Blendable: Genome {
    fn blend(&self, other: &Self, alpha: f64) -> Self;
}
