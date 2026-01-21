import React, { useState, useEffect } from 'react';
import { MeshViewer } from './components/MeshViewer';
import { 
  Dna, 
  RotateCcw, 
  Settings2, 
  Info,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface Genome {
  frequency: number;
  lacunarity: number;
  persistence: number;
  octaves: number;
  seed: number;
  offset_x: number;
  offset_y: number;
  ridge_threshold: number;
  turbulence: number;
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
  
  // GA Settings
  const [mutationRate, setMutationRate] = useState(0.15);
  const [elitismCount, setElitismCount] = useState(1);

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

  const exportMesh = async (genome: Genome) => {
    try {
      const res = await fetch('/api/export-obj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(genome)
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mesh_${genome.seed}.obj`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
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
          mutation_rate: mutationRate,
          elitism_count: elitismCount
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
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30">
      {/* Sidebar / Controls */}
      <aside className="fixed left-0 top-0 bottom-0 w-80 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 p-8 z-50 flex flex-col gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="text-white" size={18} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase">Mesh Evolver</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">Procedural 3D Generation</p>
        </div>

        <nav className="flex flex-col gap-6">
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Settings2 size={12} /> Evolutionary Settings
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Mutation Rate</span>
                <span className="text-indigo-400">{(mutationRate * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" min="0.01" max="0.5" step="0.01"
                value={mutationRate}
                onChange={(e) => setMutationRate(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Elitism</span>
                <span className="text-indigo-400">{elitismCount}</span>
              </div>
              <input 
                type="range" min="0" max="4" step="1"
                value={elitismCount}
                onChange={(e) => setElitismCount(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-4">
             <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4">
                <div className="flex items-center gap-3 text-indigo-400 mb-2">
                  <Info size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Instructions</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Select the meshes that exhibit the most interesting topological features. Click evolve to breed them.
                </p>
             </div>
          </div>
        </nav>

        <div className="mt-auto flex flex-col gap-3">
          <button 
            onClick={fetchPopulation}
            className="w-full py-3 rounded-xl border border-slate-800 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm font-bold"
          >
            <RotateCcw size={16} /> Reset
          </button>
          <button 
            onClick={evolve}
            disabled={selectedIndices.size === 0 || loading}
            className="w-full py-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-20 disabled:hover:bg-indigo-50 text-white font-bold transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <Dna className="animate-spin" size={20} />
            ) : (
              <>
                Breed Generation <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-80 p-12">
        <header className="flex justify-between items-center mb-12">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-3xl font-black text-white">Evolutionary Farm</h2>
              <span className="px-3 py-1 bg-slate-900 rounded-full text-indigo-400 text-xs font-mono border border-slate-800">
                GEN {generation}
              </span>
            </div>
            <p className="text-slate-500 font-medium">Population of 12 Procedural Organisms</p>
          </div>
          
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono">
               Selected: <span className="text-indigo-400 font-bold">{selectedIndices.size}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
          {population.map((genome, i) => (
            <div key={`${generation}-${i}`} className="space-y-4">
              {meshes[i] ? (
                <MeshViewer 
                  vertices={meshes[i].vertices} 
                  indices={meshes[i].indices} 
                  selected={selectedIndices.has(i)}
                  onClick={() => toggleSelect(i)}
                  onExport={() => exportMesh(genome)}
                />
              ) : (
                <div className="w-full aspect-square bg-slate-900/50 animate-pulse rounded-xl flex items-center justify-center border border-slate-800/50">
                   <Dna className="text-slate-800 animate-spin" size={48} />
                </div>
              )}
              
              <div className="flex justify-between items-center px-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Genome Seed</span>
                  <span className="text-xs font-mono text-slate-400">0x{genome.seed.toString(16).toUpperCase()}</span>
                </div>
                <div className="flex gap-4">
                   <div className="text-right">
                      <span className="block text-[9px] font-bold text-slate-600 uppercase">Frequency</span>
                      <span className="text-[11px] font-mono text-indigo-400/80">{genome.frequency.toFixed(3)}</span>
                   </div>
                   <div className="text-right">
                      <span className="block text-[9px] font-bold text-slate-600 uppercase">Ridges</span>
                      <span className="text-[11px] font-mono text-emerald-400/80">{genome.ridge_threshold.toFixed(2)}</span>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default App;
