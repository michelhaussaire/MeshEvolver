//! Selection Algorithms
//!
//! Estrategias de selección para algoritmos genéticos.

use crate::genomes::Genome;
use rand::prelude::*;

/// Selección por torneo
pub fn tournament_selection<T: Genome>(population: &[(T, f64)], tournament_size: usize) -> &T {
    let mut rng = thread_rng();
    let mut best = &population[rng.gen_range(0..population.len())].0;
    let mut best_fitness = best.fitness();

    for _ in 1..tournament_size {
        let candidate = &population[rng.gen_range(0..population.len())].0;
        let fitness = candidate.fitness();
        if fitness > best_fitness {
            best = candidate;
            best_fitness = fitness;
        }
    }

    best
}

/// Selección proporcional al fitness (Roulette Wheel)
pub fn roulette_selection<T: Genome>(population: &[(T, f64)]) -> &T {
    let mut rng = thread_rng();
    let total_fitness: f64 = population.iter().map(|(_, f)| f).sum();
    let mut point = rng.gen::<f64>() * total_fitness;

    for (genome, fitness) in population {
        point -= fitness;
        if point <= 0.0 {
            return genome;
        }
    }

    &population.last().unwrap().0
}

/// Selección elitista
pub fn elitist_selection<T: Genome>(population: &[(T, f64)], count: usize) -> Vec<&T> {
    let mut sorted: Vec<_> = population.iter().collect();
    sorted.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());
    sorted.iter().take(count).map(|(g, _)| g).collect()
}
