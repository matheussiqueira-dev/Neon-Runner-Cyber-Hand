import { create } from 'zustand';
import { GameStatus, GameState, Lane } from './types';

export const useGameStore = create<GameState>((set) => ({
  status: GameStatus.IDLE,
  score: 0,
  highScore: parseInt(localStorage.getItem('neon_runner_highscore') || '0'),
  speed: 10,
  lane: Lane.CENTER,
  isJumping: false,
  isSliding: false,

  setStatus: (status) => set({ status }),
  addScore: (amount) => set((state) => {
    const newScore = state.score + amount;
    if (newScore > state.highScore) {
      localStorage.setItem('neon_runner_highscore', newScore.toString());
      return { score: newScore, highScore: newScore };
    }
    return { score: newScore };
  }),
  
  setLane: (lane) => set((state) => {
    if (lane < -1) return { lane: -1 };
    if (lane > 1) return { lane: 1 };
    return { lane };
  }),

  setJumping: (isJumping) => set({ isJumping }),
  setSliding: (isSliding) => set({ isSliding }),

  increaseSpeed: () => set((state) => ({ speed: Math.min(state.speed + 0.1, 20) })), 

  resetGame: () => set({
    status: GameStatus.PLAYING,
    score: 0,
    speed: 12,
    lane: Lane.CENTER,
    isJumping: false,
    isSliding: false
  })
}));
