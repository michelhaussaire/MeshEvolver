/**
 * Educational Store
 * 
 * Estado global para la experiencia educativa de CosmosLearn.
 * Gestiona preferencias de usuario, progreso y configuraciones.
 */

import { create } from 'zustand';

interface EducationalState {
  // Preferencias de usuario
  preferredLanguage: 'es' | 'en';
  detailLevel: 'basic' | 'intermediate' | 'advanced';
  showTooltips: boolean;

  // Progreso
  completedChallenges: string[];
  unlockedAlgorithms: string[];
  totalScore: number;

  // Acciones
  setLanguage: (lang: 'es' | 'en') => void;
  setDetailLevel: (level: 'basic' | 'intermediate' | 'advanced') => void;
  completeChallenge: (challengeId: string) => void;
  unlockAlgorithm: (algorithmId: string) => void;
}

export const useEducationalStore = create<EducationalState>((set) => ({
  preferredLanguage: 'es',
  detailLevel: 'intermediate',
  showTooltips: true,
  completedChallenges: [],
  unlockedAlgorithms: ['perlin'],
  totalScore: 0,

  setLanguage: (lang) => set({ preferredLanguage: lang }),
  setDetailLevel: (level) => set({ detailLevel: level }),
  completeChallenge: (challengeId) =>
    set((state) => ({
      completedChallenges: [...state.completedChallenges, challengeId],
    })),
  unlockAlgorithm: (algorithmId) =>
    set((state) => ({
      unlockedAlgorithms: [...state.unlockedAlgorithms, algorithmId],
    })),
}));
