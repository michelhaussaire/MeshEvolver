import React, { useState, useEffect } from 'react';
import GalaxyViewer from './components/GalaxyViewer';
import GalaxyScene from './components/GalaxyScene';
import { 
  Dna, 
  RotateCcw, 
  Settings2, 
  Info,
  ChevronRight,
  Sparkles,
  Star
} from 'lucide-react';

interface GalaxyGenome {
  num_arms: number;
  arm_tightness: number;
  core_density: number;
  arm_spread: number;
  star_count: number;
  color_temperature: number;
  rotation_speed: number;
  ellipticity: number;
  seed: number;
}

interface GalaxyPoints {
  positions: number[];
  colors: number[];
  sizes: number[];
}

const GalaxyApp: React.FC = () => {
  const [population, setPopulation] = useState<GalaxyGenome[]>([]);
  const [galaxies, setGalaxies] = useState<Record<number, GalaxyPoints>>({});
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [generation, setGeneration] = useState(1);
  
  const [mutationRate, setMutationRate] = useState(0.15);
  const [elitismCount, setElitismCount] = useState(1);
  const [autoRotate, setAutoRotate] = useState(true);

  const fetchGalaxyPopulation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/init-galaxy-population?count=12');
      const data = await res.json();
      setPopulation(data);
      setSelectedIndices(new Set());
      setGeneration(1);
    } catch (err) {
      console.error("Failed to fetch galaxy population", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGalaxyPoints = async (genome: GalaxyGenome, index: number) => {
    try {
      const res = await fetch('/api/generate-galaxy-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(genome)
      });
      const data = await res.json();
      setGalaxies(prev => ({ ...prev, [index]: data }));
    } catch (err) {
      console.error(`Failed to fetch galaxy points ${index}`, err);
    }
  };

  useEffect(() => {
    fetchGalaxyPopulation();
  }, []);

  useEffect(() => {
    population.forEach((genome, i) => {
      if (!galaxies[i]) fetchGalaxyPoints(genome, i);
    });
  }, [population]);

  const toggleSelect = (index: number) => {
    const next = new Set(selectedIndices);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedIndices(next);
  };

  const evolveGalaxies = async () => {
    if (selectedIndices.size === 0) return;
    setLoading(true);
    
    const popWithFitness = population.map((g, i) => ({
      genome: g,
      fitness: selectedIndices.has(i) ? 1.0 : 0.05
    }));

    try {
      const res = await fetch('/api/evolve-galaxy', {
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
      setGalaxies({});
      setSelectedIndices(new Set());
      setGeneration(prev => prev + 1);
    } catch (err) {
      console.error("Galaxy evolution failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-purple-500/30">
      <aside className="fixed left-0 top-0 bottom-0 w-80 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 p-8 z-50 flex flex-col gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Star className="text-white" size={18} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase">Galaxy Evolver</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">Procedural Universe Generator</p>
        </div>

        <nav className="flex flex-col gap-6">
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Settings2 size={12} /> Evolutionary Settings
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Mutation Rate</span>
                <span className="text-purple-400">{(mutationRate * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" min="0.01" max="0.5" step="0.01"
                value={mutationRate}
                onChange={(e) => setMutationRate(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Auto Rotate</span>
                <span className="text-purple-400">{autoRotate ? 'ON' : 'OFF'}</span>
              </div>
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`w-full py-2 rounded-lg border ${autoRotate ? 'bg-purple-500/10 border-purple-500 text-purple-400' : 'bg-slate-800 border-slate-700 text-slate-400'} text-xs font-bold transition-all`}
              >
                {autoRotate ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-4">
             <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-4">
                <div className="flex items-center gap-3 text-purple-400 mb-2">
                  <Info size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Instructions</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Select galaxies with interesting spiral arm configurations and stellar distributions. Click evolve to breed them.
                </p>
             </div>
          </div>
        </nav>

        <div className="mt-auto flex flex-col gap-3">
          <button 
            onClick={fetchGalaxyPopulation}
            className="w-full py-3 rounded-xl border border-slate-800 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm font-bold"
          >
            <RotateCcw size={16} /> Reset
          </button>
          <button 
            onClick={evolveGalaxies}
            disabled={selectedIndices.size === 0 || loading}
            className="w-full py-4 rounded-xl bg-purple-500 hover:bg-purple-400 disabled:opacity-20 disabled:hover:bg-purple-50 text-white font-bold transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 group"
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

      <main className="ml-80 p-12">
        <header className="flex justify-between items-center mb-12">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-3xl font-black text-white">Galaxy Evolution</h2>
              <span className="px-3 py-1 bg-slate-900 rounded-full text-purple-400 text-xs font-mono border border-slate-800">
                GEN {generation}
              </span>
            </div>
            <p className="text-slate-500 font-medium">Population of 12 Procedural Galaxies</p>
          </div>
          
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono">
               Selected: <span className="text-purple-400 font-bold">{selectedIndices.size}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
          {population.map((genome, i) => (
            <div key={`${generation}-${i}`} className="space-y-4">
              {galaxies[i] ? (
                <GalaxyScene autoRotate={autoRotate}>
                  <GalaxyViewer 
                    positions={galaxies[i].positions} 
                    colors={galaxies[i].colors} 
                    sizes={galaxies[i].sizes} 
                    selected={selectedIndices.has(i)}
                    onClick={() => toggleSelect(i)}
                  />
                </GalaxyScene>
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
                      <span className="block text-[9px] font-bold text-slate-600 uppercase">Arms</span>
                      <span className="text-[11px] font-mono text-purple-400/80">{genome.num_arms}</span>
                   </div>
                   <div className="text-right">
                      <span className="block text-[9px] font-bold text-slate-600 uppercase">Stars</span>
                      <span className="text-[11px] font-mono text-emerald-400/80">{(genome.star_count / 1000).toFixed(0)}k</span>
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

export default GalaxyApp;
