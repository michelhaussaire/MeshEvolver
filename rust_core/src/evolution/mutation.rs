//! Mutation Operations
//!
//! Operadores de mutación para introducir variabilidad.

use crate::genomes::Genome;
use rand::prelude::*;

/// Mutación gaussiana
///
/// Agrega ruido gaussiano a los genes.
pub fn gaussian_mutation<T: Genome>(genome: &mut T, rate: f64, strength: f64) {
    genome.mutate(rate, strength);
}

/// Mutación de un punto
///
/// Cambia un gen específico a un valor aleatorio.
pub fn point_mutation<T, F>(genome: &mut T, rate: f64, gene_mutator: F)
where
    F: Fn(&mut T),
{
    let mut rng = thread_rng();
    if rng.gen::<f64>() < rate {
        gene_mutator(genome);
    }
}

/// Mutación adaptativa
///
/// Ajusta la tasa de mutación según la diversidad de la población.
pub struct AdaptiveMutation {
    pub base_rate: f64,
    pub min_rate: f64,
    pub max_rate: f64,
    pub diversity_threshold: f64,
}

impl AdaptiveMutation {
    pub fn new(base_rate: f64) -> Self {
        Self {
            base_rate,
            min_rate: 0.001,
            max_rate: 0.5,
            diversity_threshold: 0.1,
        }
    }

    pub fn calculate_rate(&self, diversity: f64) -> f64 {
        if diversity < self.diversity_threshold {
            // Aumentar mutación si la diversidad es baja
            (self.base_rate * 2.0).min(self.max_rate)
        } else {
            self.base_rate
        }
        .max(self.min_rate)
    }
}

/// Creep mutation - cambios pequeños y graduales
pub fn creep_mutation(value: &mut f64, rate: f64, max_change: f64) {
    let mut rng = thread_rng();
    if rng.gen::<f64>() < rate {
        let change = rng.gen_range(-max_change..=max_change);
        *value += change;
    }
}
