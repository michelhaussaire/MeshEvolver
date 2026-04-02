//! Galaxy Genome
//!
//! Parámetros genéticos para generación procedural de galaxias.
//! Incluye propiedades de forma espiral, densidad, etc.

use super::Genome;

/// Genoma para galaxias espirales
#[derive(Clone, Debug)]
pub struct GalaxyGenome {
    /// Número de brazos espirales
    pub num_arms: u32,

    /// Apretura de los brazos (0.0 = muy apretados, 1.0 = muy abiertos)
    pub arm_tightness: f64,

    /// Densidad del núcleo galáctico (0.0 - 1.0)
    pub core_density: f64,

    /// Cantidad de estrellas
    pub star_count: u32,

    /// Velocidad de rotación del brazo
    pub rotation_speed: f64,

    /// Dispersión del brazo (qué tan ancho es)
    pub arm_dispersion: f64,

    /// Bulge ratio (proporción del bulbo central)
    pub bulge_ratio: f64,

    /// Ruido de perturbación para irregularidades
    pub perturbation: f64,

    /// Tipo de galaxia (0.0 = espiral puro, 1.0 = barrada)
    pub bar_strength: f64,
}

impl Genome for GalaxyGenome {
    fn random() -> Self {
        use rand::Rng;
        let mut rng = rand::thread_rng();

        Self {
            num_arms: rng.gen_range(2..=6),
            arm_tightness: rng.gen_range(0.1..=0.9),
            core_density: rng.gen_range(0.3..=0.95),
            star_count: rng.gen_range(1000..=50000),
            rotation_speed: rng.gen_range(0.1..=2.0),
            arm_dispersion: rng.gen_range(0.05..=0.3),
            bulge_ratio: rng.gen_range(0.1..=0.4),
            perturbation: rng.gen_range(0.0..=0.3),
            bar_strength: rng.gen_range(0.0..=1.0),
        }
    }

    fn crossover(&self, other: &Self, ratio: f64) -> Self {
        let r = ratio.clamp(0.0, 1.0);
        Self {
            num_arms: if r < 0.5 {
                self.num_arms
            } else {
                other.num_arms
            },
            arm_tightness: self.arm_tightness * (1.0 - r) + other.arm_tightness * r,
            core_density: self.core_density * (1.0 - r) + other.core_density * r,
            star_count: ((self.star_count as f64) * (1.0 - r) + (other.star_count as f64) * r)
                as u32,
            rotation_speed: self.rotation_speed * (1.0 - r) + other.rotation_speed * r,
            arm_dispersion: self.arm_dispersion * (1.0 - r) + other.arm_dispersion * r,
            bulge_ratio: self.bulge_ratio * (1.0 - r) + other.bulge_ratio * r,
            perturbation: self.perturbation * (1.0 - r) + other.perturbation * r,
            bar_strength: self.bar_strength * (1.0 - r) + other.bar_strength * r,
        }
    }

    fn mutate(&mut self, rate: f64, strength: f64) {
        use rand::Rng;
        let mut rng = rand::thread_rng();

        if rng.gen::<f64>() < rate {
            // Mutate num_arms occasionally
            if rng.gen::<f64>() < 0.1 {
                self.num_arms = (self.num_arms as i32 + rng.gen_range(-1..=1)).clamp(2, 8) as u32;
            }
        }

        if rng.gen::<f64>() < rate {
            self.arm_tightness =
                (self.arm_tightness + rng.gen_range(-strength..=strength)).clamp(0.1, 0.9);
        }

        if rng.gen::<f64>() < rate {
            self.core_density =
                (self.core_density + rng.gen_range(-strength..=strength)).clamp(0.1, 1.0);
        }

        if rng.gen::<f64>() < rate {
            self.star_count =
                ((self.star_count as f64) * (1.0 + rng.gen_range(-strength..=strength))) as u32;
            self.star_count = self.star_count.clamp(100, 100000);
        }

        if rng.gen::<f64>() < rate {
            self.arm_dispersion =
                (self.arm_dispersion + rng.gen_range(-strength..=strength) * 0.1).clamp(0.01, 0.5);
        }
    }

    fn fitness(&self) -> f64 {
        // Fitness basado en qué tan "realista" es la galaxia
        let mut score = 1.0;

        // Penalizar núcleos muy densos con pocos brazos
        if self.core_density > 0.9 && self.num_arms < 3 {
            score *= 0.5;
        }

        // Favorecer galaxias con dispersión natural
        if self.arm_dispersion > 0.1 && self.arm_dispersion < 0.25 {
            score *= 1.2;
        }

        // Penalizar rotaciones extremas
        if self.rotation_speed > 3.0 {
            score *= 0.7;
        }

        score
    }
}
