import React from 'react';
import { useGameStore } from '../store';
import { GameStatus } from '../types';

export const UI: React.FC = () => {
  const { status, score, resetGame } = useGameStore();

  if (status === GameStatus.IDLE) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-40">
        <h1 className="text-6xl md:text-8xl font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 mb-4 tracking-tighter filter drop-shadow-[0_0_10px_rgba(0,243,255,0.8)]">
          NEON RUNNER
        </h1>
        <div className="text-cyan-200 font-mono mb-8 text-center max-w-md space-y-2">
            <p>SYSTEM_CHECK: CAMERA REQUIRED</p>
            <p className="text-sm text-gray-400">Controls:</p>
            <ul className="text-left text-sm space-y-1 bg-gray-900 p-4 rounded border border-gray-700">
                <li>👋 <span className="text-white font-bold">Swipe Hand:</span> Change Lane</li>
                <li>👆 <span className="text-white font-bold">Hand Up:</span> Jump</li>
                <li>👇 <span className="text-white font-bold">Hand Down:</span> Slide</li>
            </ul>
        </div>
        <button 
            onClick={resetGame}
            className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-display font-bold text-xl rounded clip-path-polygon transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(8,145,178,0.6)]"
            style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
        >
            INITIALIZE RUN
        </button>
      </div>
    );
  }

  if (status === GameStatus.GAME_OVER) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/40 z-40 backdrop-blur-sm">
        <h2 className="text-6xl font-display text-red-500 mb-2 filter drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">CRITICAL FAILURE</h2>
        <p className="text-2xl font-mono text-white mb-6">DISTANCE RECORD: {score}</p>
        <button 
            onClick={resetGame}
            className="px-8 py-3 bg-white text-red-900 font-bold font-display text-xl rounded hover:bg-gray-200 transition-all"
        >
            REBOOT SYSTEM
        </button>
      </div>
    );
  }

  // HUD
  return (
    <div className="absolute top-0 left-0 w-full p-6 flex justify-between z-30 pointer-events-none">
       <div className="flex flex-col">
           <span className="text-xs text-cyan-400 font-mono">SCORE_METRIC</span>
           <span className="text-4xl font-display text-white filter drop-shadow-[0_0_5px_#00f3ff]">{score.toString().padStart(6, '0')}</span>
       </div>
       <div className="flex flex-col items-end">
           <span className="text-xs text-purple-400 font-mono">SYSTEM_STATUS</span>
           <span className="text-xl font-display text-green-400 animate-pulse">OPTIMAL</span>
       </div>
    </div>
  );
};