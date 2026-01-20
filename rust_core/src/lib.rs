use pyo3::prelude::*;
use noise::{NoiseFn, Perlin, Seedable};
use rand::prelude::*;

#[pyclass]
#[derive(Clone, Debug)]
struct Genome {
    #[pyo3(get, set)]
    frequency: f64,
    #[pyo3(get, set)]
    lacunarity: f64,
    #[pyo3(get, set)]
    persistence: f64,
    #[pyo3(get, set)]
    octaves: usize,
    #[pyo3(get, set)]
    seed: u32,
    #[pyo3(get, set)]
    offset_x: f64,
    #[pyo3(get, set)]
    offset_y: f64,
}

#[pymethods]
impl Genome {
    #[new]
    fn new(frequency: f64, lacunarity: f64, persistence: f64, octaves: usize, seed: u32) -> Self {
        Genome { frequency, lacunarity, persistence, octaves, seed, offset_x: 0.0, offset_y: 0.0 }
    }

    #[staticmethod]
    fn random() -> Self {
        let mut rng = rand::thread_rng();
        Genome {
            frequency: rng.gen_range(0.01..0.2),
            lacunarity: rng.gen_range(1.5..2.5),
            persistence: rng.gen_range(0.2..0.7),
            octaves: rng.gen_range(1..6),
            seed: rng.gen(),
            offset_x: rng.gen_range(-1000.0..1000.0),
            offset_y: rng.gen_range(-1000.0..1000.0),
        }
    }
}

#[pyclass]
struct Texture {
    #[pyo3(get)]
    width: usize,
    #[pyo3(get)]
    height: usize,
    #[pyo3(get)]
    data: Vec<f64>, // Flattened 2D array
}

#[pyclass]
struct Mesh {
    #[pyo3(get)]
    vertices: Vec<f64>, // Flattened x, y, z
    #[pyo3(get)]
    indices: Vec<u32>,
}

#[pyfunction]
fn generate_texture(genome: &Genome, width: usize, height: usize) -> Texture {
    let perlin = Perlin::new(genome.seed);
    let mut data = Vec::with_capacity(width * height);

    for y in 0..height {
        for x in 0..width {
            let mut amplitude = 1.0;
            let mut frequency = genome.frequency;
            let mut noise_value = 0.0;
            let mut max_value = 0.0;

            for _ in 0..genome.octaves {
                let sample_x = (x as f64 + genome.offset_x) * frequency;
                let sample_y = (y as f64 + genome.offset_y) * frequency;
                
                noise_value += perlin.get([sample_x, sample_y]) * amplitude;
                max_value += amplitude;
                
                amplitude *= genome.persistence;
                frequency *= genome.lacunarity;
            }
            
            // Normalize to 0.0 - 1.0
            let normalized = if max_value > 0.0 { (noise_value / max_value) + 0.5 } else { 0.5 };
            data.push(normalized.clamp(0.0, 1.0));
        }
    }

    Texture { width, height, data }
}

#[pyfunction]
fn generate_mesh(genome: &Genome, width: usize, height: usize, scale: f64) -> Mesh {
    let texture = generate_texture(genome, width, height);
    let mut vertices = Vec::new();
    let mut indices = Vec::new();

    // Generate vertices
    for y in 0..height {
        for x in 0..width {
            let z = texture.data[y * width + x] * scale;
            vertices.push(x as f64);
            vertices.push(y as f64);
            vertices.push(z);
        }
    }

    // Generate indices
    for y in 0..height - 1 {
        for x in 0..width - 1 {
            let top_left = (y * width + x) as u32;
            let top_right = (y * width + x + 1) as u32;
            let bottom_left = ((y + 1) * width + x) as u32;
            let bottom_right = ((y + 1) * width + x + 1) as u32;

            // Triangle 1
            indices.push(top_left);
            indices.push(bottom_left);
            indices.push(top_right);

            // Triangle 2
            indices.push(top_right);
            indices.push(bottom_left);
            indices.push(bottom_right);
        }
    }

    Mesh { vertices, indices }
}

fn tournament_select<'a, R: Rng>(population: &'a Vec<(Genome, f64)>, rng: &mut R) -> &'a Genome {
    let size = 3;
    let mut best: Option<&(Genome, f64)> = None;

    for _ in 0..size {
        let idx = rng.gen_range(0..population.len());
        let candidate = &population[idx];
        match best {
            None => best = Some(candidate),
            Some(b) => {
                if candidate.1 > b.1 {
                    best = Some(candidate);
                }
            }
        }
    }
    &best.unwrap().0
}

fn crossover<R: Rng>(p1: &Genome, p2: &Genome, rng: &mut R) -> Genome {
    Genome {
        frequency: if rng.gen() { p1.frequency } else { p2.frequency },
        lacunarity: if rng.gen() { p1.lacunarity } else { p2.lacunarity },
        persistence: if rng.gen() { p1.persistence } else { p2.persistence },
        octaves: if rng.gen() { p1.octaves } else { p2.octaves },
        seed: if rng.gen() { p1.seed } else { p2.seed },
        offset_x: if rng.gen() { p1.offset_x } else { p2.offset_x },
        offset_y: if rng.gen() { p1.offset_y } else { p2.offset_y },
    }
}

fn mutate<R: Rng>(genome: &mut Genome, rate: f64, rng: &mut R) {
    if rng.gen_bool(rate) {
        genome.frequency += rng.gen_range(-0.05..0.05);
        genome.frequency = genome.frequency.clamp(0.001, 1.0);
    }
    if rng.gen_bool(rate) {
        genome.lacunarity += rng.gen_range(-0.2..0.2);
    }
    if rng.gen_bool(rate) {
        genome.persistence += rng.gen_range(-0.1..0.1);
        genome.persistence = genome.persistence.clamp(0.0, 1.0);
    }
    if rng.gen_bool(rate) {
        if rng.gen() {
            if genome.octaves < 8 { genome.octaves += 1; }
        } else {
            if genome.octaves > 1 { genome.octaves -= 1; }
        }
    }
    if rng.gen_bool(rate) {
        genome.offset_x += rng.gen_range(-10.0..10.0);
        genome.offset_y += rng.gen_range(-10.0..10.0);
    }
    if rng.gen_bool(rate * 0.1) {
        genome.seed = rng.gen();
    }
}

#[pyfunction]
fn evolve_population(
    current_population: Vec<(Genome, f64)>, // (Genome, fitness)
    mutation_rate: f64,
    elitism_count: usize
) -> Vec<Genome> {
    let mut rng = rand::thread_rng();
    let mut new_population = Vec::new();
    
    // Sort by fitness (descending)
    let mut sorted_pop = current_population.clone();
    sorted_pop.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));

    // Elitism: Keep the best ones
    for i in 0..elitism_count {
        if i < sorted_pop.len() {
            new_population.push(sorted_pop[i].0.clone());
        }
    }

    // Fill the rest
    while new_population.len() < current_population.len() {
        // Tournament Selection
        let parent1 = tournament_select(&sorted_pop, &mut rng);
        let parent2 = tournament_select(&sorted_pop, &mut rng);

        // Crossover
        let mut child = crossover(parent1, parent2, &mut rng);

        // Mutation
        mutate(&mut child, mutation_rate, &mut rng);

        new_population.push(child);
    }

    new_population
}

#[pymodule]
fn procedural_graph_core(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_class::<Genome>()?;
    m.add_class::<Texture>()?;
    m.add_class::<Mesh>()?;
    m.add_function(wrap_pyfunction!(generate_texture, m)?)?;
    m.add_function(wrap_pyfunction!(generate_mesh, m)?)?;
    m.add_function(wrap_pyfunction!(evolve_population, m)?)?;
    Ok(())
}
