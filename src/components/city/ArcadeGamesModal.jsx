import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

const TABS = [
  { id: 'snake', label: 'SNAKE' },
  { id: 'pong', label: 'PONG' },
  { id: 'breakout', label: 'BREAKOUT' },
];

function SnakeGame({ active }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const directionRef = useRef({ x: 1, y: 0 });
  const nextDirectionRef = useRef({ x: 1, y: 0 });
  const snakeRef = useRef([{ x: 8, y: 8 }]);
  const foodRef = useRef({ x: 12, y: 8 });

  useEffect(() => {
    if (!active) return;
    const size = 16;
    const tile = 18;
    const ctx = canvasRef.current.getContext('2d');

    const placeFood = () => {
      let next = { x: Math.floor(Math.random() * size), y: Math.floor(Math.random() * size) };
      while (snakeRef.current.some((part) => part.x === next.x && part.y === next.y)) {
        next = { x: Math.floor(Math.random() * size), y: Math.floor(Math.random() * size) };
      }
      foodRef.current = next;
    };

    const reset = () => {
      snakeRef.current = [{ x: 8, y: 8 }];
      directionRef.current = { x: 1, y: 0 };
      nextDirectionRef.current = { x: 1, y: 0 };
      setScore(0);
      placeFood();
    };

    const onKey = (e) => {
      if (e.key === 'ArrowUp' && directionRef.current.y !== 1) nextDirectionRef.current = { x: 0, y: -1 };
      if (e.key === 'ArrowDown' && directionRef.current.y !== -1) nextDirectionRef.current = { x: 0, y: 1 };
      if (e.key === 'ArrowLeft' && directionRef.current.x !== 1) nextDirectionRef.current = { x: -1, y: 0 };
      if (e.key === 'ArrowRight' && directionRef.current.x !== -1) nextDirectionRef.current = { x: 1, y: 0 };
    };

    reset();
    window.addEventListener('keydown', onKey);

    const interval = setInterval(() => {
      directionRef.current = nextDirectionRef.current;
      const head = snakeRef.current[0];
      const next = {
        x: (head.x + directionRef.current.x + size) % size,
        y: (head.y + directionRef.current.y + size) % size,
      };

      if (snakeRef.current.some((part) => part.x === next.x && part.y === next.y)) {
        reset();
        return;
      }

      const nextSnake = [next, ...snakeRef.current];
      if (next.x === foodRef.current.x && next.y === foodRef.current.y) {
        setScore((value) => value + 10);
        placeFood();
      } else {
        nextSnake.pop();
      }
      snakeRef.current = nextSnake;

      ctx.fillStyle = '#05070f';
      ctx.fillRect(0, 0, size * tile, size * tile);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      for (let i = 0; i <= size; i += 1) {
        ctx.beginPath();
        ctx.moveTo(i * tile, 0);
        ctx.lineTo(i * tile, size * tile);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * tile);
        ctx.lineTo(size * tile, i * tile);
        ctx.stroke();
      }

      ctx.fillStyle = '#ff4fd8';
      ctx.fillRect(foodRef.current.x * tile + 3, foodRef.current.y * tile + 3, tile - 6, tile - 6);

      snakeRef.current.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? '#70f0ff' : '#3ad7ff';
        ctx.fillRect(part.x * tile + 2, part.y * tile + 2, tile - 4, tile - 4);
      });
    }, 120);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', onKey);
    };
  }, [active]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between font-orbitron text-xs tracking-[0.25em] text-cyan-300">
        <span>SCORE {score}</span>
        <span>↑ ↓ ← →</span>
      </div>
      <canvas ref={canvasRef} width={288} height={288} className="mx-auto rounded-xl border border-cyan-300/30 bg-black shadow-[0_0_30px_rgba(0,255,255,0.12)] [image-rendering:pixelated]" />
    </div>
  );
}

function PongGame({ active }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState({ left: 0, right: 0 });

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const state = {
      leftY: 120,
      rightY: 120,
      ballX: 240,
      ballY: 140,
      ballVX: 3.6,
      ballVY: 2.4,
      up: false,
      down: false,
    };
    let frameId;

    const resetBall = (dir = 1) => {
      state.ballX = 240;
      state.ballY = 140;
      state.ballVX = 3.6 * dir;
      state.ballVY = (Math.random() * 2 + 1.8) * (Math.random() > 0.5 ? 1 : -1);
    };

    const onKeyDown = (e) => {
      if (e.key === 'ArrowUp') state.up = true;
      if (e.key === 'ArrowDown') state.down = true;
    };
    const onKeyUp = (e) => {
      if (e.key === 'ArrowUp') state.up = false;
      if (e.key === 'ArrowDown') state.down = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const render = () => {
      if (state.up) state.leftY -= 6;
      if (state.down) state.leftY += 6;
      state.leftY = Math.max(0, Math.min(220, state.leftY));

      const target = state.ballY - 30;
      state.rightY += (target - state.rightY) * 0.12;
      state.rightY = Math.max(0, Math.min(220, state.rightY));

      state.ballX += state.ballVX;
      state.ballY += state.ballVY;

      if (state.ballY <= 8 || state.ballY >= 272) state.ballVY *= -1;
      if (state.ballX <= 28 && state.ballY >= state.leftY && state.ballY <= state.leftY + 60) state.ballVX = Math.abs(state.ballVX);
      if (state.ballX >= 452 && state.ballY >= state.rightY && state.ballY <= state.rightY + 60) state.ballVX = -Math.abs(state.ballVX);

      if (state.ballX < 0) {
        setScore((value) => ({ ...value, right: value.right + 1 }));
        resetBall(1);
      }
      if (state.ballX > 480) {
        setScore((value) => ({ ...value, left: value.left + 1 }));
        resetBall(-1);
      }

      ctx.clearRect(0, 0, 480, 280);
      ctx.fillStyle = '#05070f';
      ctx.fillRect(0, 0, 480, 280);
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.setLineDash([8, 10]);
      ctx.beginPath();
      ctx.moveTo(240, 0);
      ctx.lineTo(240, 280);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#70f0ff';
      ctx.fillRect(18, state.leftY, 10, 60);
      ctx.fillStyle = '#ff4fd8';
      ctx.fillRect(452, state.rightY, 10, 60);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(state.ballX, state.ballY, 7, 0, Math.PI * 2);
      ctx.fill();

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [active]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between font-orbitron text-xs tracking-[0.25em] text-cyan-300">
        <span>{score.left} - {score.right}</span>
        <span>↑ ↓</span>
      </div>
      <canvas ref={canvasRef} width={480} height={280} className="mx-auto w-full max-w-[480px] rounded-xl border border-cyan-300/30 bg-black shadow-[0_0_30px_rgba(0,255,255,0.12)] [image-rendering:auto]" />
    </div>
  );
}

function BreakoutGame({ active }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);

  const bricks = useMemo(() => Array.from({ length: 24 }, (_, index) => ({
    x: 20 + (index % 6) * 74,
    y: 26 + Math.floor(index / 6) * 26,
    alive: true,
  })), []);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const state = {
      paddleX: 190,
      ballX: 240,
      ballY: 210,
      ballVX: 3.4,
      ballVY: -3.4,
      left: false,
      right: false,
      bricks: bricks.map((brick) => ({ ...brick })),
    };
    let frameId;
    setScore(0);

    const reset = () => {
      state.paddleX = 190;
      state.ballX = 240;
      state.ballY = 210;
      state.ballVX = 3.4;
      state.ballVY = -3.4;
      state.bricks = bricks.map((brick) => ({ ...brick }));
      setScore(0);
    };

    const onKeyDown = (e) => {
      if (e.key === 'ArrowLeft') state.left = true;
      if (e.key === 'ArrowRight') state.right = true;
    };
    const onKeyUp = (e) => {
      if (e.key === 'ArrowLeft') state.left = false;
      if (e.key === 'ArrowRight') state.right = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const render = () => {
      if (state.left) state.paddleX -= 7;
      if (state.right) state.paddleX += 7;
      state.paddleX = Math.max(12, Math.min(388, state.paddleX));

      state.ballX += state.ballVX;
      state.ballY += state.ballVY;

      if (state.ballX <= 8 || state.ballX >= 472) state.ballVX *= -1;
      if (state.ballY <= 8) state.ballVY *= -1;
      if (state.ballY >= 250 && state.ballX >= state.paddleX && state.ballX <= state.paddleX + 80) {
        state.ballVY = -Math.abs(state.ballVY);
      }
      if (state.ballY > 280) {
        reset();
        frameId = requestAnimationFrame(render);
        return;
      }

      state.bricks.forEach((brick) => {
        if (!brick.alive) return;
        if (state.ballX >= brick.x && state.ballX <= brick.x + 62 && state.ballY >= brick.y && state.ballY <= brick.y + 16) {
          brick.alive = false;
          state.ballVY *= -1;
          setScore((value) => value + 5);
        }
      });

      if (state.bricks.every((brick) => !brick.alive)) {
        reset();
        frameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, 480, 280);
      ctx.fillStyle = '#05070f';
      ctx.fillRect(0, 0, 480, 280);
      state.bricks.forEach((brick, index) => {
        if (!brick.alive) return;
        ctx.fillStyle = index % 3 === 0 ? '#70f0ff' : index % 3 === 1 ? '#b47dff' : '#ff4fd8';
        ctx.fillRect(brick.x, brick.y, 62, 16);
      });
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(state.paddleX, 258, 80, 10);
      ctx.beginPath();
      ctx.arc(state.ballX, state.ballY, 7, 0, Math.PI * 2);
      ctx.fill();

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [active, bricks]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between font-orbitron text-xs tracking-[0.25em] text-cyan-300">
        <span>SCORE {score}</span>
        <span>← →</span>
      </div>
      <canvas ref={canvasRef} width={480} height={280} className="mx-auto w-full max-w-[480px] rounded-xl border border-cyan-300/30 bg-black shadow-[0_0_30px_rgba(0,255,255,0.12)] [image-rendering:auto]" />
    </div>
  );
}

export default function ArcadeGamesModal({ open, onClose }) {
  const [activeGame, setActiveGame] = useState('snake');

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[140] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-cyan-300/25 bg-[linear-gradient(180deg,rgba(4,10,22,0.98),rgba(8,8,18,0.96))] shadow-[0_0_80px_rgba(0,255,255,0.12)]"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8">
              <div>
                <p className="font-rajdhani text-[11px] uppercase tracking-[0.45em] text-cyan-300/75">Arcade</p>
                <h2 className="font-orbitron text-2xl font-bold tracking-[0.14em] text-white sm:text-3xl">NEXUS PLAY</h2>
              </div>
              <button onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-cyan-300/40 hover:text-cyan-300">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 px-5 py-4 sm:px-8">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveGame(tab.id)}
                  className={`rounded-full px-4 py-2 font-orbitron text-xs tracking-[0.28em] transition ${activeGame === tab.id ? 'bg-white text-black' : 'border border-white/10 bg-white/5 text-white/75 hover:text-white'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="px-5 pb-6 sm:px-8 sm:pb-8">
              {activeGame === 'snake' && <SnakeGame active={open && activeGame === 'snake'} />}
              {activeGame === 'pong' && <PongGame active={open && activeGame === 'pong'} />}
              {activeGame === 'breakout' && <BreakoutGame active={open && activeGame === 'breakout'} />}
              <p className="mt-4 text-center font-rajdhani text-sm text-white/55">Pulsa ESC para volver al mundo.</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}