//! Planet Genome
//!
//! Parámetros genéticos para generación procedural de planetas.

use super::Genome;

/// Tipo atmosférico del planeta
#[derive(Clone, Debug)]
pub enum AtmosphereType {
    None,
    Thin,     // Marte
    Moderate, // Tierra
    Thick,    // Venus
    GasGiant, // Júpiter, Saturno
}

/// Tipo de superficie
#[derive(Clone, Debug)]
pub enum SurfaceType {
    Rocky,
    Icy,
    Oceanic,
    Gas,
    Lava,
}

/// Genoma para planetas
#[derive(Clone, Debug)]
pub struct PlanetGenome {
    /// Radio del planeta (en radios terrestres)
    pub radius: f64,

    /// Masa (en masas terrestres)
    pub mass: f64,

    /// Temperatura superficial promedio (K)
    pub surface_temperature: f64,

    /// Porcentaje de cobertura de agua (0.0 - 1.0)
    pub water_coverage: f64,

    /// Altura máxima del terreno (km)
    pub max_elevation: f64,

    /// Profundidad máxima de océanos (km)
    pub ocean_depth: f64,

    /// Tipo de atmósfera
    pub atmosphere: AtmosphereType,

    /// Tipo de superficie
    pub surface: SurfaceType,

    /// Nivel de actividad volcánica (0.0 - 1.0)
    pub volcanic_activity: f64,

    /// Nivel de erosión (0.0 - 1.0)
    pub erosion_level: f64,

    /// Número de lunas
    pub moon_count: u32,

    /// Velocidad de rotación (horas por día)
    pub rotation_period: f64,

    /// Inclinación axial (grados)
    pub axial_tilt: f64,
}

impl Genome for PlanetGenome {
    fn random() -> Self {
        use rand::Rng;
        let mut rng = rand::thread_rng();

        Self {
            radius: rng.gen_range(0.3..=15.0),
            mass: rng.gen_range(0.1..=500.0),
            surface_temperature: rng.gen_range(50.0..=1000.0),
            water_coverage: rng.gen_range(0.0..=1.0),
            max_elevation: rng.gen_range(1.0..=25.0),
            ocean_depth: rng.gen_range(1.0..=20.0),
            atmosphere: match rng.gen_range(0..5) {
                0 => AtmosphereType::None,
                1 => AtmosphereType::Thin,
                2 => AtmosphereType::Moderate,
                3 => AtmosphereType::Thick,
                _ => AtmosphereType::GasGiant,
            },
            surface: match rng.gen_range(0..5) {
                0 => SurfaceType::Rocky,
                1 => SurfaceType::Icy,
                2 => SurfaceType::Oceanic,
                3 => SurfaceType::Gas,
                _ => SurfaceType::Lava,
            },
            volcanic_activity: rng.gen_range(0.0..=1.0),
            erosion_level: rng.gen_range(0.0..=1.0),
            moon_count: rng.gen_range(0..=10),
            rotation_period: rng.gen_range(6.0..=240.0),
            axial_tilt: rng.gen_range(0.0..=90.0),
        }
    }

    fn crossover(&self, other: &Self, ratio: f64) -> Self {
        let r = ratio.clamp(0.0, 1.0);
        Self {
            radius: self.radius * (1.0 - r) + other.radius * r,
            mass: self.mass * (1.0 - r) + other.mass * r,
            surface_temperature: self.surface_temperature * (1.0 - r)
                + other.surface_temperature * r,
            water_coverage: self.water_coverage * (1.0 - r) + other.water_coverage * r,
            max_elevation: self.max_elevation * (1.0 - r) + other.max_elevation * r,
            ocean_depth: self.ocean_depth * (1.0 - r) + other.ocean_depth * r,
            atmosphere: if r < 0.5 {
                self.atmosphere.clone()
            } else {
                other.atmosphere.clone()
            },
            surface: if r < 0.5 {
                self.surface.clone()
            } else {
                other.surface.clone()
            },
            volcanic_activity: self.volcanic_activity * (1.0 - r) + other.volcanic_activity * r,
            erosion_level: self.erosion_level * (1.0 - r) + other.erosion_level * r,
            moon_count: if r < 0.5 {
                self.moon_count
            } else {
                other.moon_count
            },
            rotation_period: self.rotation_period * (1.0 - r) + other.rotation_period * r,
            axial_tilt: self.axial_tilt * (1.0 - r) + other.axial_tilt * r,
        }
    }

    fn mutate(&mut self, rate: f64, strength: f64) {
        use rand::Rng;
        let mut rng = rand::thread_rng();

        if rng.gen::<f64>() < rate {
            self.radius *= 1.0 + rng.gen_range(-strength..=strength);
            self.radius = self.radius.clamp(0.1, 30.0);
        }

        if rng.gen::<f64>() < rate {
            self.water_coverage += rng.gen_range(-strength..=strength);
            self.water_coverage = self.water_coverage.clamp(0.0, 1.0);
        }

        if rng.gen::<f64>() < rate {
            self.surface_temperature += rng.gen_range(-100.0..=100.0) * strength;
            self.surface_temperature = self.surface_temperature.clamp(10.0, 2000.0);
        }
    }

    fn fitness(&self) -> f64 {
        // Fitness basado en habitabilidad y coherencia física
        let mut score = 1.0;

        // Favorecer temperaturas habitables
        if self.surface_temperature > 273.0 && self.surface_temperature < 373.0 {
            score *= 1.5;
        }

        // Penalizar agua en planetas muy calientes
        if self.surface_temperature > 500.0 && self.water_coverage > 0.1 {
            score *= 0.5;
        }

        score
    }
}
