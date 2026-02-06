import React, { useState } from 'react';
import { 
  Trophy, 
  Library, 
  Map, 
  Sparkles, 
  History,
  Compass
} from 'lucide-react';

interface MuseumProps {
  onClose: () => void;
}

const UniverseMuseum: React.FC<MuseumProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'collection' | 'achievements' | 'history'>('collection');

  return (
    <div className="fixed inset-0 z-[100] bg-[#020617]/95 backdrop-blur-2xl flex items-center justify-center p-12">
      <div className="w-full max-w-6xl h-full bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <header className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
              <Library className="text-purple-500" /> Universe Museum
            </h2>
            <p className="text-slate-400 text-sm">Your discovered procedural cosmic wonders</p>
          </div>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-xs font-bold text-slate-300 transition-all"
          >
            EXIT MUSEUM
          </button>
        </header>

        {/* Navigation */}
        <div className="flex px-8 gap-8 border-b border-slate-800 bg-slate-900/40">
          <button 
            onClick={() => setActiveTab('collection')}
            className={`py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'collection' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            Cosmic Collection
          </button>
          <button 
            onClick={() => setActiveTab('achievements')}
            className={`py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'achievements' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            Achievements
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'history' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            Evolution History
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'collection' && (
            <div className="grid grid-cols-4 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="aspect-[3/4] bg-slate-800/50 rounded-2xl border border-slate-700/50 p-4 flex flex-col group cursor-pointer hover:border-purple-500/50 transition-all">
                  <div className="flex-1 bg-slate-900 rounded-xl mb-4 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                      <Sparkles size={48} />
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">Anomalous Galaxy #{i}42</h4>
                  <p className="text-[10px] text-slate-500 uppercase font-mono">Discovered: GEN {i * 4}</p>
                </div>
              ))}
              <div className="aspect-[3/4] border-2 border-dashed border-slate-800 rounded-2xl flex items-center justify-center text-slate-700 group hover:border-slate-600 transition-all">
                <Compass className="group-hover:animate-spin-slow" size={32} />
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              {[
                { title: 'Cosmic Architect', desc: 'Evolve a galaxy for 10 generations', icon: <Map />, progress: 100 },
                { title: 'The Great Filter', desc: 'Select only high-density cores', icon: <History />, progress: 45 },
                { title: 'Terraformer', desc: 'Generate your first habitable planet', icon: <Trophy />, progress: 10 }
              ].map((ach, i) => (
                <div key={i} className="bg-slate-800/30 p-6 rounded-2xl border border-slate-800 flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${ach.progress === 100 ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-500'}`}>
                    {ach.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-sm">{ach.title}</h4>
                    <p className="text-xs text-slate-400">{ach.desc}</p>
                    <div className="mt-3 w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: `${ach.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UniverseMuseum;
