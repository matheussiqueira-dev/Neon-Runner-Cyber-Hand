import React from 'react';
import { useGameStore } from '../store';
import { GameStatus } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Activity, Shield, Trophy, Cpu, MousePointer2 } from 'lucide-react';

export const UI: React.FC = () => {
  const status = useGameStore(s => s.status);
  const score = useGameStore(s => s.score);
  const highScore = useGameStore(s => s.highScore);
  const resetGame = useGameStore(s => s.resetGame);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  if (status === GameStatus.IDLE) {
    return (
      <AnimatePresence>
        <motion.div
          className="ui-overlay center-overlay"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={containerVariants}
        >
          <div className="menu-card glass clip-cyber">
            <motion.div variants={itemVariants} className="brand">
              <span className="brand-tag">v2.0.4 SYSTEM_READY</span>
              <h1 className="brand-title">NEON RUNNER</h1>
              <div className="brand-subtitle">CYBERNETIC_HAND_INTERFACE</div>
            </motion.div>

            <motion.div variants={itemVariants} className="controls-hint">
              <div className="hint-item">
                <MousePointer2 size={16} />
                <span>MOVA A MÃO PARA MUDAR DE PISTA</span>
              </div>
              <div className="hint-split">
                <div className="hint-item">
                  <Activity size={16} className="icon-jump" />
                  <span>SALTO: MÃO PARA CIMA</span>
                </div>
                <div className="hint-item">
                  <Shield size={16} className="icon-slide" />
                  <span>SLIDE: MÃO PARA BAIXO</span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <button onClick={resetGame} className="btn-primary clip-cyber">
                <Play fill="currentColor" size={20} />
                <span>INICIALIZAR RUN</span>
              </button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (status === GameStatus.GAME_OVER) {
    return (
      <AnimatePresence>
        <motion.div
          className="ui-overlay center-overlay fail-overlay"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="menu-card glass error-border">
            <motion.div variants={itemVariants} className="error-header">
              <h2 className="error-title">CRITICAL FAILURE</h2>
              <div className="error-code">STATUS_CODE: CONNECTION_LOST</div>
            </motion.div>

            <motion.div variants={itemVariants} className="stats-display">
              <div className="stat-box">
                <span className="stat-label">DISTÂNCIA / SCORE</span>
                <span className="stat-value">{score}m</span>
              </div>
              <div className="stat-box accent">
                <span className="stat-label">RECORDE PESSOAL</span>
                <span className="stat-value">{highScore}m</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <button onClick={resetGame} className="btn-secondary">
                <RotateCcw size={20} />
                <span>REBOOT SYSTEM</span>
              </button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // HUD
  return (
    <div className="hud-container pointer-events-none">
      <div className="hud-top">
        <div className="hud-group">
          <div className="hud-metric-label">SCORE_METRIC</div>
          <div className="hud-score-value">{score.toString().padStart(6, '0')}</div>
        </div>

        <div className="hud-group align-right">
          <div className="hud-status">
            <div className="status-indicator"></div>
            <span>SYSTEM_OPTIMAL</span>
          </div>
          <div className="hud-highscore">HI_REC: {highScore}</div>
        </div>
      </div>

      <div className="hud-bottom">
        <div className="hud-power-indicator">
          <div className="label">NEURAL_LINK</div>
          <div className="bar-container">
            <motion.div
              className="bar-fill"
              animate={{ width: ["20%", "100%", "20%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
      </div>

      <style>{`
         .ui-overlay {
           position: absolute;
           inset: 0;
           z-index: 100;
           display: flex;
           align-items: center;
           justify-content: center;
           background: rgba(0, 0, 0, 0.4);
           backdrop-filter: blur(8px);
         }
         .fail-overlay {
           background: rgba(40, 0, 0, 0.5);
         }
         .menu-card {
           padding: 3rem;
           width: 100%;
           max-width: 500px;
           text-align: center;
           border: 1px solid var(--color-cyan);
           box-shadow: 0 0 30px rgba(0, 243, 255, 0.2);
         }
         .error-border {
           border-color: var(--color-red);
           box-shadow: 0 0 30px rgba(239, 68, 68, 0.2);
         }
         .brand { margin-bottom: 2.5rem; }
         .brand-tag {
           font-family: var(--font-mono);
           font-size: 0.7rem;
           color: var(--color-cyan);
           letter-spacing: 0.2rem;
         }
         .brand-title {
           font-size: 5rem;
           line-height: 1;
           font-weight: 900;
           margin: 0.5rem 0;
           font-family: var(--font-display);
           background: linear-gradient(to right, #fff, var(--color-cyan), var(--color-purple));
           -webkit-background-clip: text;
           -webkit-text-fill-color: transparent;
           filter: drop-shadow(0 0 10px rgba(0, 243, 255, 0.5));
         }
         .brand-subtitle {
           font-family: var(--font-mono);
           font-size: 0.8rem;
           opacity: 0.6;
           letter-spacing: 0.1rem;
         }
         .controls-hint {
           margin-bottom: 3rem;
           background: rgba(255, 255, 255, 0.05);
           padding: 1.5rem;
           border-radius: 4px;
           text-align: left;
           font-family: var(--font-mono);
           font-size: 0.75rem;
         }
         .hint-item {
           display: flex;
           align-items: center;
           gap: 0.75rem;
           margin-bottom: 1rem;
           color: var(--color-cyan);
         }
         .hint-split {
           display: grid;
           grid-template-columns: 1fr 1fr;
           gap: 1rem;
         }
         .icon-jump { color: var(--color-yellow); }
         .icon-slide { color: var(--color-magenta); }

         .btn-primary {
           display: flex;
           align-items: center;
           justify-content: center;
           gap: 0.75rem;
           width: 100%;
           padding: 1.25rem;
           background: var(--color-cyan);
           color: #000;
           border: none;
           font-family: var(--font-display);
           font-size: 1.5rem;
           font-weight: bold;
           cursor: pointer;
           transition: all 0.2s ease;
         }
         .btn-primary:hover {
           background: #fff;
           transform: scale(1.02);
           box-shadow: 0 0 20px var(--color-cyan);
         }

         .error-header { margin-bottom: 2rem; }
         .error-title {
           font-size: 3rem;
           color: var(--color-red);
           font-family: var(--font-display);
           text-shadow: 0 0 10px var(--color-red);
         }
         .error-code { font-family: var(--font-mono); font-size: 0.7rem; opacity: 0.5; }

         .stats-display {
           display: grid;
           grid-template-columns: 1fr 1fr;
           gap: 1rem;
           margin-bottom: 2.5rem;
         }
         .stat-box {
           background: rgba(255, 255, 255, 0.03);
           padding: 1rem;
           border-radius: 4px;
           display: flex;
           flex-col: column;
           gap: 0.25rem;
         }
         .stat-box.accent { border-top: 2px solid var(--color-magenta); }
         .stat-label { font-size: 0.6rem; font-family: var(--font-mono); opacity: 0.5; display: block; }
         .stat-value { font-size: 1.5rem; font-family: var(--font-display); }

         .btn-secondary {
           display: flex;
           align-items: center;
           justify-content: center;
           gap: 0.75rem;
           width: 100%;
           padding: 1rem;
           background: transparent;
           color: #fff;
           border: 1px solid var(--color-red);
           font-family: var(--font-display);
           font-size: 1.25rem;
           cursor: pointer;
           transition: all 0.2s ease;
         }
         .btn-secondary:hover {
           background: var(--color-red);
           color: #fff;
         }

         /* HUD Styles */
         .hud-container {
           position: absolute;
           inset: 0;
           z-index: 50;
           padding: 2rem;
           display: flex;
           flex-direction: column;
           justify-content: space-between;
         }
         .hud-top {
           display: flex;
           justify-content: space-between;
           align-items: flex-start;
         }
         .hud-metric-label { font-family: var(--font-mono); font-size: 0.7rem; color: var(--color-cyan); }
         .hud-score-value { font-family: var(--font-display); font-size: 3rem; text-shadow: 0 0 10px var(--color-cyan); }
         
         .align-right { text-align: right; }
         .hud-status {
           display: flex;
           align-items: center;
           gap: 0.5rem;
           font-family: var(--font-mono);
           font-size: 0.75rem;
           color: #22c55e;
         }
         .status-indicator { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 5px #22c55e; animation: blink 1s infinite; }
         @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
         
         .hud-highscore { font-family: var(--font-mono); font-size: 0.75rem; opacity: 0.6; margin-top: 0.25rem; }

         .hud-bottom { width: 100%; max-width: 300px; }
         .hud-power-indicator { font-family: var(--font-mono); font-size: 0.6rem; }
         .hud-power-indicator .label { margin-bottom: 0.25rem; opacity: 0.5; }
         .bar-container { height: 4px; background: rgba(255, 255, 255, 0.1); border-radius: 2px; overflow: hidden; }
         .bar-fill { height: 100%; background: var(--color-purple); box-shadow: 0 0 10px var(--color-purple); }

         @media (max-width: 768px) {
           .brand-title { font-size: 3rem; }
           .menu-card { padding: 1.5rem; }
           .hud-score-value { font-size: 2rem; }
         }
       `}</style>
    </div>
  );
};
