import React, { useState, useEffect } from 'react';
import { MeshViewer } from './components/MeshViewer';

interface Genome {
  frequency: number;
  lacunarity: number;
  persistence: number;
  octaves: number;
  seed: number;
  offset_x: number;
  offset_y: number;
}

interface MeshData {
  vertices: number[];
  indices: number[];
}

const App: React.FC = () => {
  const [population, setPopulation] = useState<Genome[]>([]);
  const [meshes, setMeshes] = useState<Record<number, MeshData>>({});
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [generation, setGeneration] = useState(1);

  const fetchPopulation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/init-population?count=12');
      const data = await res.json();
      setPopulation(data);
      setSelectedIndices(new Set());
      setGeneration(1);
    } catch (err) {
      console.error("Failed to fetch population", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMesh = async (genome: Genome, index: number) => {
    try {
      const res = await fetch('/api/generate-mesh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(genome)
      });
      const data = await res.json();
      setMeshes(prev => ({ ...prev, [index]: data }));
    } catch (err) {
      console.error(`Failed to fetch mesh ${index}`, err);
    }
  };

  useEffect(() => {
    fetchPopulation();
  }, []);

  useEffect(() => {
    population.forEach((genome, i) => {
      if (!meshes[i]) fetchMesh(genome, i);
    });
  }, [population]);

  const toggleSelect = (index: number) => {
    const next = new Set(selectedIndices);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedIndices(next);
  };

  const evolve = async () => {
    if (selectedIndices.size === 0) return;
    setLoading(true);
    
    // Assign fitness: selected = 1.0, unselected = 0.1
    const popWithFitness = population.map((g, i) => ({
      genome: g,
      fitness: selectedIndices.has(i) ? 1.0 : 0.05
    }));

    try {
      const res = await fetch('/api/evolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          population: popWithFitness,
          mutation_rate: 0.15,
          elitism_count: 1
        })
      });
      const nextPop = await res.json();
      setPopulation(nextPop);
      setMeshes({});
      setSelectedIndices(new Set());
      setGeneration(prev => prev + 1);
    } catch (err) {
      console.error("Evolution failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <header className="max-w-7xl mx-auto mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-500">
            MESH EVOLVER
          </h1>
          <p className="text-slate-400 font-medium">Generation {generation} • Genetic Algorithm + Perlin Noise</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={fetchPopulation}
            className="px-6 py-2 rounded-full border border-slate-700 hover:bg-slate-800 transition-colors font-semibold"
          >
            Reset
          </button>
          <button 
            onClick={evolve}
            disabled={selectedIndices.size === 0 || loading}
            className="px-8 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:hover:bg-emerald-500 text-slate-950 font-bold transition-all transform active:scale-95 shadow-lg shadow-emerald-500/20"
          >
            {loading ? 'Evolving...' : `Evolve Selection (${selectedIndices.size})`}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {population.map((genome, i) => (
          <div key={`${generation}-${i}`} className="flex flex-col gap-2">
            {meshes[i] ? (
              <MeshViewer 
                vertices={meshes[i].vertices} 
                indices={meshes[i].indices} 
                selected={selectedIndices.has(i)}
                onClick={() => toggleSelect(i)}
              />
            ) : (
              <div className="w-full aspect-square bg-slate-900 animate-pulse rounded-lg flex items-center justify-center">
                <span className="text-slate-700 font-bold">GENERATING...</span>
              </div>
            )}
            <div className="px-1 flex justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <span>Seed: {genome.seed.toString(16)}</span>
              <span>Freq: {genome.frequency.toFixed(3)}</span>
            </div>
          </div>
        ))}
      </main>
      
      <footer className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-900 text-center text-slate-600 text-sm">
        Select the meshes you like and click Evolve to breed the next generation.
      </footer>
    </div>
  );
};

export default App;
