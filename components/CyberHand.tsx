import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGameStore } from '../store';
import { initializeHandLandmarker, detectHands, analyzeGesture, GestureType } from '../services/gestureService';
import { GameStatus } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ShieldAlert, Cpu } from 'lucide-react';

export const CyberHand: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGesture, setLastGesture] = useState<string>("");
  const requestRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);

  const DETECTION_INTERVAL_MS = 33; // ~30 FPS

  const handleGestureRecognition = useCallback((gesture: GestureType) => {
    if (gesture === GestureType.NONE) return;

    setLastGesture(gesture);
    setTimeout(() => setLastGesture(""), 1000);

    const state = useGameStore.getState();
    if (state.status !== GameStatus.PLAYING) return;

    switch (gesture) {
      case GestureType.SWIPE_LEFT:
        state.setLane(state.lane - 1);
        break;
      case GestureType.SWIPE_RIGHT:
        state.setLane(state.lane + 1);
        break;
      case GestureType.JUMP:
        if (!state.isJumping) state.setJumping(true);
        break;
      case GestureType.SLIDE:
        if (!state.isSliding) state.setSliding(true);
        break;
    }
  }, []);

  useEffect(() => {
    const setup = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, frameRate: 30 }
        });

        if (videoRef.current) {
          streamRef.current = stream;
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = async () => {
            await initializeHandLandmarker();
            setIsLoaded(true);
          };
        }
      } catch (err) {
        setError("CAMERA_ACCESS_DENIED: VERIFY PERMISSIONS");
      }
    };

    setup();
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const drawSkel = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (!landmarks?.length) return;

    const hand = landmarks[0];
    const connections = [
      [0, 1, 2, 3, 4], [0, 5, 6, 7, 8], [5, 9, 10, 11, 12], [9, 13, 14, 15, 16], [13, 17, 18, 19, 20], [0, 17]
    ];

    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00f3ff';

    connections.forEach(path => {
      ctx.beginPath();
      path.forEach((idx, i) => {
        const x = (1 - hand[idx].x) * ctx.canvas.width;
        const y = hand[idx].y * ctx.canvas.height;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });

    hand.forEach((p: any) => {
      const x = (1 - p.x) * ctx.canvas.width;
      const y = p.y * ctx.canvas.height;
      ctx.fillStyle = '#ff00ff';
      ctx.shadowColor = '#ff00ff';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const loop = (time: number) => {
    if (videoRef.current && canvasRef.current && isLoaded) {
      const results = detectHands(videoRef.current, Date.now());
      const ctx = canvasRef.current.getContext('2d');
      if (ctx && results?.landmarks?.length) {
        drawSkel(ctx, results.landmarks);
        const gesture = analyzeGesture(results.landmarks);
        handleGestureRecognition(gesture);
      } else if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }
    }
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (isLoaded) requestRef.current = requestAnimationFrame(loop);
  }, [isLoaded]);

  return (
    <div className="hand-preview-container glass neon-border-cyan">
      <video ref={videoRef} autoPlay playsInline muted className="camera-feed" />
      <canvas ref={canvasRef} width={640} height={480} className="skeleton-overlay" />

      <div className="hand-status-bar">
        <div className="status-label">
          <Cpu size={12} className={isLoaded ? "icon-online" : ""} />
          <span>{isLoaded ? "NEURAL_LINK: ACTIVE" : "SYNCING_SENSORS..."}</span>
        </div>
      </div>

      <AnimatePresence>
        {lastGesture && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="gesture-popup"
          >
            {lastGesture}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="hand-error-overlay">
          <ShieldAlert size={32} color="var(--color-red)" />
          <p>{error}</p>
        </div>
      )}

      <style>{`
        .hand-preview-container {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          width: 280px;
          height: 210px;
          z-index: 60;
          overflow: hidden;
          background: #000;
          border-radius: 8px;
        }
        .camera-feed {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.4;
          transform: scaleX(-1);
        }
        .skeleton-overlay {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        .hand-status-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          background: rgba(0, 243, 255, 0.2);
          padding: 4px 8px;
          font-family: var(--font-mono);
          font-size: 0.6rem;
          color: var(--color-cyan);
        }
        .status-label { display: flex; align-items: center; gap: 6px; }
        .icon-online { color: #22c55e; filter: drop-shadow(0 0 5px #22c55e); }
        
        .gesture-popup {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-family: var(--font-display);
          font-size: 2rem;
          color: var(--color-yellow);
          text-shadow: 0 0 15px var(--color-yellow);
          pointer-events: none;
        }

        .hand-error-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.8);
          padding: 1rem;
          text-align: center;
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--color-red);
        }

        @media (max-width: 768px) {
          .hand-preview-container {
            width: 180px;
            height: 135px;
            top: 0.5rem;
            right: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};
