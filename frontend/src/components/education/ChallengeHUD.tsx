/**
 * ChallengeHUD Component
 * 
 * Interfaz de juego para desafíos de aprendizaje.
 * Muestra progreso, objetivos y puntuación.
 */

import React from 'react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface ChallengeHUDProps {
  challenge: Challenge;
  progress: number;
  score: number;
  timeRemaining?: number;
}

export const ChallengeHUD: React.FC<ChallengeHUDProps> = ({
  challenge,
  progress,
  score,
  timeRemaining,
}) => {
  return (
    <div className="challenge-hud">
      <h3>{challenge.title}</h3>
      <div className="progress-bar">
        <div className="progress" style={{ width: `${progress}%` }} />
      </div>
      <div className="score">Score: {score}</div>
      {timeRemaining && <div className="timer">{timeRemaining}s</div>}
    </div>
  );
};
