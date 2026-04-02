import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';
import {
  Sparkles,
  BookOpen,
  Waves,
  Settings2,
  Info,
  ChevronRight,
  Dna,
  RotateCcw,
  Beaker,
  Award,
  Menu,
  X,
  Globe,
  Zap
} from 'lucide-react';

// Lazy load components for code splitting
const DualExplanation = lazy(() => import('./components/education/DualExplanation'));
const AlgorithmSelector = lazy(() => import('./components/education/AlgorithmSelector'));
const OceanShader = lazy(() => import('./components/OceanShader'));
const MeshViewer = lazy(() => import('./components/MeshViewer').then(m => ({ default: m.MeshViewer })));

// Types
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

type AlgorithmType = 'perlin' | 'simplex' | 'worley_f1' | 'worley_f2_f1' | 'fbm';
type ViewMode = 'evolution' | 'education' | 'ocean';

const App: React.FC = () => {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('education');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('simplex');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // MeshEvolver State (existing)
  const [population, setPopulation] = useState<Genome[]>([]);
  const [meshes, setMeshes] = useState<Record<number, MeshData>>({});
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [generation, setGeneration] = useState(1);
  const [mutationRate, setMutationRate] = useState(0.15);
  const [elitismCount, setElitismCount] = useState(1);
  
  // Educational Content State
  const [selectedCategory, setSelectedCategory] = useState('ocean');
  const [selectedFeature, setSelectedFeature] = useState('ocean_waves');

  // Fetch population for evolution mode
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
    if (viewMode === 'evolution') {
      population.forEach((genome, i) => {
        if (!meshes[i]) fetchMesh(genome, i);
      });
    }
  }, [population, viewMode]);

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

  // Navigation items
  const navItems = [
    { id: 'education' as ViewMode, label: 'Aprendizaje', icon: BookOpen, description: 'Explora conceptos científicos y algoritmos' },
    { id: 'ocean' as ViewMode, label: 'Océanos', icon: Waves, description: 'Visualización de agua con shaders' },
    { id: 'evolution' as ViewMode, label: 'Evolución', icon: Dna, description: 'Algoritmos genéticos y mallas 3D' },
  ];

  // Educational categories
  const eduCategories = [
    { id: 'ocean', label: 'Océanos', features: ['ocean_waves'] },
    { id: 'atmosphere', label: 'Atmósfera', features: ['atmosphere_composition'] },
    { id: 'vegetation', label: 'Vegetación', features: ['biome_distribution'] },
    { id: 'evolution', label: 'Evolución', features: ['genetic_algorithms'] },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30 overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">CosmosLearn</h1>
              <p className="text-xs text-slate-500">Aprende astrofísica generando universos</p>
            </div>
          </div>
        </div>

        {/* Navigation Pills */}
        <nav className="hidden md:flex items-center gap-2 bg-slate-800/50 p-1 rounded-xl">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setViewMode(item.id)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${
                viewMode === item.id
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg text-xs">
            <Zap size={14} className="text-yellow-500" />
            <span className="text-slate-400">XP:</span>
            <span className="text-yellow-400 font-bold">1,250</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
            M
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 w-80 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800 transition-transform duration-300 z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 space-y-6 h-full overflow-y-auto">
          {/* Current Mode Info */}
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2 text-indigo-400">
              {navItems.find(n => n.id === viewMode)?.icon && (
                <>{React.createElement(navItems.find(n => n.id === viewMode)!.icon, { size: 18 })}</>
              )}
              <span className="text-xs font-bold uppercase tracking-wider">
                {navItems.find(n => n.id === viewMode)?.label}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {navItems.find(n => n.id === viewMode)?.description}
            </p>
          </div>

          {/* Mode-specific Sidebar Content */}
          {viewMode === 'education' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Categorías
              </h3>
              <div className="space-y-2">
                {eduCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSelectedFeature(cat.features[0]);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Algoritmo Activo
                </h3>
                <Suspense fallback={<div className="h-32 bg-slate-800/30 animate-pulse rounded-lg" />}>
                  <AlgorithmSelector
                    selectedAlgorithm={selectedAlgorithm}
                    onSelect={setSelectedAlgorithm}
                    showComparison={false}
                  />
                </Suspense>
              </div>
            </div>
          )}

          {viewMode === 'ocean' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Parámetros del Océano
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">Frecuencia de Olas</label>
                  <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.1"
                    defaultValue="0.8"
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">Amplitud</label>
                  <input
                    type="range"
                    min="0.05"
                    max="0.5"
                    step="0.05"
                    defaultValue="0.2"
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">Velocidad</label>
                  <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.1"
                    defaultValue="1.0"
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>

              <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4">
                <div className="flex items-center gap-2 text-indigo-400 mb-2">
                  <Beaker size={14} />
                  <span className="text-xs font-bold uppercase">Algoritmo: Simplex Noise</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Usamos Simplex Noise 3D para generar ondas realistas sin patrones direccionales.
                </p>
              </div>
            </div>
          )}

          {viewMode === 'evolution' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Settings2 size={12} /> Configuración GA
                </h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Tasa de Mutación</span>
                    <span className="text-indigo-400">{(mutationRate * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="0.5"
                    step="0.01"
                    value={mutationRate}
                    onChange={(e) => setMutationRate(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Elitismo</span>
                    <span className="text-indigo-400">{elitismCount}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="4"
                    step="1"
                    value={elitismCount}
                    onChange={(e) => setElitismCount(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4">
                  <div className="flex items-center gap-3 text-indigo-400 mb-2">
                    <Info size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Instrucciones</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Selecciona las mallas con características topológicas más interesantes. Haz clic en Evolucionar para reproducirlas.
                  </p>
                </div>
              </div>

              <div className="mt-auto space-y-3">
                <button
                  onClick={fetchPopulation}
                  className="w-full py-3 rounded-xl border border-slate-700 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm font-bold"
                >
                  <RotateCcw size={16} /> Reiniciar
                </button>
                <button
                  onClick={evolve}
                  disabled={selectedIndices.size === 0 || loading}
                  className="w-full py-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-20 disabled:hover:bg-indigo-500 text-white font-bold transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <Dna className="animate-spin" size={20} />
                  ) : (
                    <>
                      Evolucionar <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`pt-16 transition-all duration-300 ${
          sidebarOpen ? 'ml-80' : 'ml-0'
        }`}
      >
        {/* EDUCATION MODE */}
        {viewMode === 'education' && (
          <div className="h-[calc(100vh-4rem)] flex">
            {/* Left: Educational Content */}
            <div className="flex-1 overflow-y-auto p-8">
              <Suspense fallback={
                <div className="h-96 bg-slate-800/30 animate-pulse rounded-xl" />
              }>
                <DualExplanation
                  category={selectedCategory as 'ocean' | 'atmosphere' | 'vegetation' | 'evolution'}
                  featureId={selectedFeature}
                  locale="es"
                />
              </Suspense>
            </div>

            {/* Right: Visual Preview */}
            <div className="w-[500px] bg-slate-900/50 border-l border-slate-800 p-6">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Globe size={16} className="text-indigo-400" />
                Visualización
              </h3>
              <div className="h-[400px] rounded-xl overflow-hidden border border-slate-700">
                <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[5, 5, 5]} intensity={1} />
                  <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
                  
                  {selectedCategory === 'ocean' && (
                    <OceanShader
                      frequency={0.8}
                      amplitude={0.2}
                      speed={0.8}
                      colorDeep="#003b5c"
                      colorShallow="#006994"
                      radius={3}
                      resolution={128}
                    />
                  )}
                  
                  {selectedCategory !== 'ocean' && (
                    <mesh>
                      <sphereGeometry args={[3, 64, 64]} />
                      <meshStandardMaterial color="#2d5016" />
                    </mesh>
                  )}
                  
                  <OrbitControls enablePan={false} autoRotate autoRotateSpeed={0.5} />
                  <Environment preset="sunset" />
                </Canvas>
              </div>
              
              <div className="mt-4 bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Algoritmo Seleccionado
                </h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <Zap size={20} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white capitalize">
                      {selectedAlgorithm.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-slate-500">
                      Complejidad: O(n²)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OCEAN MODE */}
        {viewMode === 'ocean' && (
          <div className="h-[calc(100vh-4rem)] relative">
            <Canvas
              camera={{ position: [0, 0, 12], fov: 45 }}
              gl={{ antialias: true, alpha: true }}
            >
              <ambientLight intensity={0.3} />
              <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
              <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4a90e2" />
              
              <Stars
                radius={100}
                depth={50}
                count={5000}
                factor={4}
                saturation={0}
                fade
                speed={1}
              />
              
              {/* Ocean Planet */}
              <OceanShader
                frequency={0.8}
                amplitude={0.2}
                speed={1.0}
                colorDeep="#003b5c"
                colorShallow="#006994"
                specularStrength={0.9}
                transparency={0.85}
                sunDirection={[1, 1, 0.5]}
                resolution={128}
                radius={5}
              />
              
              {/* Atmosphere glow */}
              <mesh>
                <sphereGeometry args={[5.8, 64, 64]} />
                <meshBasicMaterial
                  color="#4a90e2"
                  transparent
                  opacity={0.1}
                  side={THREE.BackSide}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
              
              <OrbitControls
                enablePan={false}
                autoRotate
                autoRotateSpeed={0.3}
                minDistance={8}
                maxDistance={20}
              />
              <Environment preset="sunset" />
            </Canvas>

            {/* Overlay Info */}
            <div className="absolute top-6 left-6 bg-slate-900/80 backdrop-blur-xl rounded-xl p-4 border border-slate-700 max-w-sm">
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Waves size={20} className="text-cyan-400" />
                Océano Procedural
              </h2>
              <p className="text-sm text-slate-400 mb-4">
                Visualización de agua realista usando Simplex Noise 3D en shaders GLSL.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Algoritmo:</span>
                  <span className="text-cyan-400 font-mono">Simplex Noise 3D</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Complejidad:</span>
                  <span className="text-cyan-400 font-mono">O(n²)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Efectos:</span>
                  <span className="text-cyan-400">Fresnel, Especular, Cáusticos</span>
                </div>
              </div>
            </div>

            {/* Algorithm Badge */}
            <div className="absolute bottom-6 right-6 bg-slate-900/80 backdrop-blur-xl rounded-xl px-4 py-3 border border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-slate-400">Shader compilado en tiempo real</span>
              </div>
            </div>
          </div>
        )}

        {/* EVOLUTION MODE */}
        {viewMode === 'evolution' && (
          <div className="p-8">
            <header className="flex justify-between items-center mb-8">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-3xl font-black text-white">Granja Evolutiva</h2>
                  <span className="px-3 py-1 bg-slate-900 rounded-full text-indigo-400 text-xs font-mono border border-slate-800">
                    GEN {generation}
                  </span>
                </div>
                <p className="text-slate-500 font-medium">Población de 12 Organismos Procedurales</p>
              </div>

              <div className="flex gap-4">
                <div className="px-4 py-2 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono">
                  Seleccionados: <span className="text-indigo-400 font-bold">{selectedIndices.size}</span>
                </div>
                <div className="px-4 py-2 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono">
                  Algoritmo: <span className="text-emerald-400 font-bold">{selectedAlgorithm}</span>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
              {population.map((genome, i) => (
                <div key={`${generation}-${i}`} className="space-y-4">
                  {meshes[i] ? (
                    <Suspense fallback={<div className="aspect-square bg-slate-800/30 animate-pulse rounded-xl" />}>
                      <MeshViewer
                        vertices={meshes[i].vertices}
                        indices={meshes[i].indices}
                        selected={selectedIndices.has(i)}
                        onClick={() => toggleSelect(i)}
                      />
                    </Suspense>
                  ) : (
                    <div className="w-full aspect-square bg-slate-900/50 animate-pulse rounded-xl flex items-center justify-center border border-slate-800/50">
                      <Dna className="text-slate-800 animate-spin" size={48} />
                    </div>
                  )}

                  <div className="flex justify-between items-center px-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Seed del Genoma</span>
                      <span className="text-xs font-mono text-slate-400">0x{genome.seed.toString(16).toUpperCase()}</span>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-right">
                        <span className="block text-[9px] font-bold text-slate-600 uppercase">Frecuencia</span>
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
          </div>
        )}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 p-2 flex justify-around z-50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setViewMode(item.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              viewMode === item.id ? 'text-indigo-400' : 'text-slate-500'
            }`}
          >
            <item.icon size={20} />
            <span className="text-[10px]">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
