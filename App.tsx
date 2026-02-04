import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { CyberHand } from './components/CyberHand';
import { GameScene } from './components/GameScene';
import { UI } from './components/UI';

const App: React.FC = () => {
  return (
    <div className="app-container">

      {/* Hand Tracking Overlay */}
      <CyberHand />

      {/* Premium UI Layer */}
      <UI />

      {/* 3D Core */}
      <div className="canvas-wrapper">
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 5, 8], fov: 50 }}
          gl={{
            antialias: true,
            toneMapping: 3, // ACESFilmic
            outputColorSpace: 'srgb'
          }}
        >
          <Suspense fallback={null}>
            <GameScene />
          </Suspense>
        </Canvas>
      </div>

      {/* Footer Credits */}
      <footer className="footer-credits">
        <p>
          PROJETO DESENVOLVIDO POR <span className="highlight">MATHEUS SIQUEIRA</span> |
          <a
            href="https://www.matheussiqueira.dev"
            target="_blank"
            rel="noopener noreferrer"
          >
            PORTFOLIO
          </a>
        </p>
      </footer>

      <style>{`
        .app-container {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background-color: var(--color-bg);
        }
        .canvas-wrapper {
          position: absolute;
          inset: 0;
          z-index: 1;
        }
        .footer-credits {
          position: absolute;
          bottom: 1rem;
          left: 0;
          width: 100%;
          text-align: center;
          z-index: 50;
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.3);
          pointer-events: auto;
        }
        .footer-credits .highlight {
          color: var(--color-cyan);
        }
        .footer-credits a {
          margin-left: 0.5rem;
          color: var(--color-magenta);
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .footer-credits a:hover {
          color: var(--color-white);
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default App;
