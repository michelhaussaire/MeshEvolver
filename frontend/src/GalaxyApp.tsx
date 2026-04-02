import React, { useState, useEffect } from 'react';
import GalaxyViewer from './components/GalaxyViewer';
import GalaxyScene from './components/GalaxyScene';
import PlanetScene from './components/PlanetScene';
import UniverseMuseum from './components/UniverseMuseum';
import RealCatalogBrowser from './components/RealCatalogBrowser';
import { 
  Dna, 
  RotateCcw, 
  Settings2, 
  Sparkles,
  Star,
  Globe,
  LayoutGrid,
  ChevronRight,
  Library,
  Check,
  BookOpen
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
  thickness: number;
  seed: number;
}

interface PlanetGenome {
  elevation_scale: number;
  ocean_level: number;
  mountain_sharpness: number;
  crater_density: number;
  ice_cap_coverage: number;
  desert_threshold: number;
  forest_density: number;
  cloud_density: number;
  frequency: number;
  lacunarity: number;
  persistence: number;
  octaves: number;
  seed: number;
  atmosphere_thickness: number;
}

interface GalaxyPoints {
  positions: number[];
  colors: number[];
  sizes: number[];
}

interface PlanetMesh {
  vertices: number[];
  indices: number[];
}

const GalaxyApp: React.FC = () => {
  const [view, setView] = useState<'galaxies' | 'planets'>('galaxies');
  const [showMuseum, setShowMuseum] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const [population, setPopulation] = useState<GalaxyGenome[]>([]);
  const [planetPopulation, setPlanetPopulation] = useState<PlanetGenome[]>([]);
  const [galaxies, setGalaxies] = useState<Record<number, GalaxyPoints>>({});
  const [planets, setPlanets] = useState<Record<number, PlanetMesh>>({});
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [generation, setGeneration] = useState(1);
  const [planetGeneration, setPlanetGeneration] = useState(1);
  
  const [mutationRate, setMutationRate] = useState(0.15);
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

  const fetchPlanetPopulation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/init-planet-population?count=12');
      const data = await res.json();
      setPlanetPopulation(data);
      setSelectedIndices(new Set());
      setPlanetGeneration(1);
    } catch (err) {
      console.error("Failed to fetch planet population", err);
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

  const fetchPlanetMesh = async (genome: PlanetGenome, index: number) => {
    try {
      const res = await fetch('/api/generate-planet-mesh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(genome)
      });
      const data = await res.json();
      setPlanets(prev => ({ ...prev, [index]: data }));
    } catch (err) {
      console.error(`Failed to fetch planet mesh ${index}`, err);
    }
  };

  useEffect(() => {
    if (view === 'galaxies' && population.length === 0) fetchGalaxyPopulation();
    if (view === 'planets' && planetPopulation.length === 0) fetchPlanetPopulation();
  }, [view]);

  useEffect(() => {
    population.forEach((genome, i) => {
      if (!galaxies[i]) fetchGalaxyPoints(genome, i);
    });
  }, [population]);

  useEffect(() => {
    planetPopulation.forEach((genome, i) => {
      if (!planets[i]) fetchPlanetMesh(genome, i);
    });
  }, [planetPopulation]);

  const toggleSelect = (index: number) => {
    const next = new Set(selectedIndices);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedIndices(next);
  };

  const evolve = async () => {
    if (selectedIndices.size === 0) return;
    setLoading(true);
    
    const endpoint = view === 'galaxies' ? '/api/evolve-galaxy' : '/api/evolve-planet';
    const currentPop = view === 'galaxies' ? population : planetPopulation;

    const popWithFitness = currentPop.map((g, i) => ({
      genome: g,
      fitness: selectedIndices.has(i) ? 1.0 : 0.05
    }));

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          population: popWithFitness,
          mutation_rate: mutationRate,
          elitism_count: 1
        })
      });
      const nextPop = await res.json();
      if (view === 'galaxies') {
        setPopulation(nextPop);
        setGalaxies({});
        setGeneration(prev => prev + 1);
      } else {
        setPlanetPopulation(nextPop);
        setPlanets({});
        setPlanetGeneration(prev => prev + 1);
      }
      setSelectedIndices(new Set());
    } catch (err) {
      console.error("Evolution failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-purple-500/30">
      <aside className="fixed left-0 top-0 bottom-0 w-80 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 p-8 z-50 flex flex-col gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 rounded-lg ${view === 'galaxies' ? 'bg-purple-500 shadow-purple-500/20' : 'bg-emerald-500 shadow-emerald-500/20'} flex items-center justify-center shadow-lg transition-colors`}>
              {view === 'galaxies' ? <Star className="text-white" size={18} /> : <Globe className="text-white" size={18} />}
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase">MeshEvolver</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">Procedural Universe Generator</p>
        </div>

        <nav className="flex flex-col gap-4">
          <button 
            onClick={() => { setView('galaxies'); setSelectedIndices(new Set()); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'galaxies' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <LayoutGrid size={18} />
            <span className="font-bold text-sm uppercase tracking-wider">Galaxies</span>
          </button>
          <button 
            onClick={() => { setView('planets'); setSelectedIndices(new Set()); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'planets' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Globe size={18} />
            <span className="font-bold text-sm uppercase tracking-wider">Planets</span>
          </button>
          <button 
            onClick={() => setShowMuseum(true)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-400 hover:bg-slate-800"
          >
            <Library size={18} />
            <span className="font-bold text-sm uppercase tracking-wider">Museum</span>
          </button>
          <button 
            onClick={() => setShowCatalog(true)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-400 hover:bg-slate-800"
          >
            <BookOpen size={18} />
            <span className="font-bold text-sm uppercase tracking-wider">Catálogo Real</span>
          </button>
        </nav>

        <div className="space-y-6 pt-4 border-t border-slate-800">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Settings2 size={12} /> Evolutionary Settings
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Mutation Rate</span>
                <span className={view === 'galaxies' ? 'text-purple-400' : 'text-emerald-400'}>{(mutationRate * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" min="0.01" max="0.5" step="0.01"
                value={mutationRate}
                onChange={(e) => setMutationRate(parseFloat(e.target.value))}
                className={`w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer ${view === 'galaxies' ? 'accent-purple-500' : 'accent-emerald-500'}`}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Auto Rotate</span>
                <span className={view === 'galaxies' ? 'text-purple-400' : 'text-emerald-400'}>{autoRotate ? 'ON' : 'OFF'}</span>
              </div>
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`w-full py-2 rounded-lg border transition-all text-xs font-bold ${
                  autoRotate 
                    ? (view === 'galaxies' ? 'bg-purple-500/10 border-purple-500 text-purple-400' : 'bg-emerald-500/10 border-emerald-500 text-emerald-400')
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {autoRotate ? 'Disable' : 'Enable'}
              </button>
            </div>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <button 
            onClick={view === 'galaxies' ? fetchGalaxyPopulation : fetchPlanetPopulation}
            className="w-full py-3 rounded-xl border border-slate-800 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm font-bold"
          >
            <RotateCcw size={16} /> Reset Population
          </button>
          <button 
            onClick={evolve}
            disabled={selectedIndices.size === 0 || loading}
            className={`w-full py-4 rounded-xl text-white font-bold transition-all shadow-xl flex items-center justify-center gap-2 group ${
              view === 'galaxies' 
                ? 'bg-purple-500 hover:bg-purple-400 shadow-purple-500/20' 
                : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'
            } disabled:opacity-20`}
          >
            {loading ? (
              <Dna className="animate-spin" size={20} />
            ) : (
              <>
                Evolve Generation <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />
              </>
            )}
          </button>
        </div>
      </aside>

      <main className="ml-80 p-12">
        <header className="flex justify-between items-center mb-12">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-3xl font-black text-white">{view === 'galaxies' ? 'Galaxy Evolution' : 'Planet Evolution'}</h2>
              <span className={`px-3 py-1 bg-slate-900 rounded-full text-xs font-mono border border-slate-800 ${view === 'galaxies' ? 'text-purple-400' : 'text-emerald-400'}`}>
                GEN {view === 'galaxies' ? generation : planetGeneration}
              </span>
            </div>
            <p className="text-slate-500 font-medium">Population of 12 Procedural {view === 'galaxies' ? 'Galaxies' : 'Planets'}</p>
          </div>
          
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono">
               Selected: <span className={`font-bold ${view === 'galaxies' ? 'text-purple-400' : 'text-emerald-400'}`}>{selectedIndices.size}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
          {view === 'galaxies' ? (
            population.map((genome, i) => (
              <div key={`galaxy-${generation}-${i}`} className="space-y-4">
                <div 
                  className={`relative rounded-2xl overflow-hidden border-2 transition-all cursor-pointer aspect-square ${
                    selectedIndices.has(i) ? 'border-purple-500 shadow-lg shadow-purple-500/20 scale-[1.02]' : 'border-slate-800 hover:border-slate-700'
                  }`}
                  onClick={() => toggleSelect(i)}
                >
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
                    <div className="w-full h-full bg-slate-900/50 animate-pulse flex items-center justify-center">
                       <Dna className="text-slate-800 animate-spin" size={48} />
                    </div>
                  )}
                  {selectedIndices.has(i) && (
                    <div className="absolute top-4 right-4 bg-purple-500 text-white rounded-full p-1 shadow-lg">
                      <Check size={20} />
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center px-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Genome Seed</span>
                    <span className="text-xs font-mono text-slate-400">0x{genome.seed.toString(16).toUpperCase()}</span>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-right">
                       <span className="block text-[9px] font-bold text-slate-600 uppercase">Mass</span>
                       <span className="text-[11px] font-mono text-purple-400/80">{(genome.thickness * 10).toFixed(1)}M</span>
                    </div>
                    <div className="text-right">
                       <span className="block text-[9px] font-bold text-slate-600 uppercase">Stars</span>
                       <span className="text-[11px] font-mono text-emerald-400/80">{(genome.star_count / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            planetPopulation.map((genome, i) => (
              <div key={`planet-${planetGeneration}-${i}`} className="space-y-4">
                <div 
                  className={`relative rounded-2xl overflow-hidden border-2 transition-all cursor-pointer aspect-square ${
                    selectedIndices.has(i) ? 'border-emerald-500 shadow-lg shadow-emerald-500/20 scale-[1.02]' : 'border-slate-800 hover:border-slate-700'
                  }`}
                  onClick={() => toggleSelect(i)}
                >
                  {planets[i] ? (
                    <PlanetScene vertices={planets[i].vertices} indices={planets[i].indices} genome={genome} />
                  ) : (
                    <div className="w-full h-full bg-slate-900/50 animate-pulse flex items-center justify-center">
                       <Dna className="text-slate-800 animate-spin" size={48} />
                    </div>
                  )}
                  {selectedIndices.has(i) && (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white rounded-full p-1 shadow-lg">
                      <Sparkles size={16} />
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center px-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Genome Seed</span>
                    <span className="text-xs font-mono text-slate-400">0x{genome.seed.toString(16).toUpperCase()}</span>
                  </div>
                  <div className="flex gap-4">
                     <div className="text-right">
                        <span className="block text-[9px] font-bold text-slate-600 uppercase">Atmosphere</span>
                        <span className="text-[11px] font-mono text-blue-400/80">{(genome.atmosphere_thickness * 100).toFixed(0)}%</span>
                     </div>
                     <div className="text-right">
                        <span className="block text-[9px] font-bold text-slate-600 uppercase">Ocean</span>
                        <span className="text-[11px] font-mono text-emerald-400/80">{(genome.ocean_level * 100).toFixed(0)}%</span>
                     </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      
      {showMuseum && <UniverseMuseum onClose={() => setShowMuseum(false)} />}
      {showCatalog && (
        <RealCatalogBrowser
          onClose={() => setShowCatalog(false)}
          onSelectObject={(genome, type) => {
            if (type === 'galaxy') {
              setView('galaxies');
              const galaxyGenome = genome as unknown as GalaxyGenome;
              setPopulation([galaxyGenome]);
              setGalaxies({});
              setGeneration(1);
            } else {
              setView('planets');
              const planetGenome = genome as unknown as PlanetGenome;
              setPlanetPopulation([planetGenome]);
              setPlanets({});
              setPlanetGeneration(1);
            }
            setShowCatalog(false);
          }}
        />
      )}
    </div>
  );
};

export default GalaxyApp;
