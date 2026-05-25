import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Trophy } from 'lucide-react';

const TABS = [
  { id: 'snake',    label: 'SNAKE'    },
  { id: 'pong',     label: 'PONG'     },
  { id: 'breakout', label: 'BREAKOUT' },
];

/* ── helpers ── */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawScanlines(ctx, W, H) {
  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.fillStyle = '#ffffff';
  for (let y = 0; y < H; y += 3) { ctx.fillRect(0, y, W, 1); }
  ctx.restore();
}

/* ════════════════════════════════════ SNAKE ════════════════════════════════ */
function SnakeGame({ active }) {
  const canvasRef   = useRef(null);
  const [score, setScore]   = useState(0);
  const [hiscore, setHiscore] = useState(0);
  const [dead, setDead]     = useState(false);

  const dirRef  = useRef({ x: 1, y: 0 });
  const nextDir = useRef({ x: 1, y: 0 });
  const snake   = useRef([{ x: 10, y: 10 }]);
  const food    = useRef({ x: 15, y: 10 });
  const scoreRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    const SIZE = 20;
    const TILE = 16;
    const W    = SIZE * TILE; // 320
    const H    = SIZE * TILE; // 320
    const canvas = canvasRef.current;
    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    const placeFood = () => {
      let f;
      do {
        f = { x: Math.floor(Math.random() * SIZE), y: Math.floor(Math.random() * SIZE) };
      } while (snake.current.some(s => s.x === f.x && s.y === f.y));
      food.current = f;
    };

    const reset = () => {
      snake.current = [{ x: 10, y: 10 }];
      dirRef.current  = { x: 1, y: 0 };
      nextDir.current = { x: 1, y: 0 };
      scoreRef.current = 0;
      setScore(0);
      setDead(false);
      placeFood();
    };

    const onKey = (e) => {
      const d = dirRef.current;
      if (e.key === 'ArrowUp'    && d.y !== 1)  nextDir.current = { x: 0, y: -1 };
      if (e.key === 'ArrowDown'  && d.y !== -1) nextDir.current = { x: 0, y:  1 };
      if (e.key === 'ArrowLeft'  && d.x !== 1)  nextDir.current = { x: -1, y: 0 };
      if (e.key === 'ArrowRight' && d.x !== -1) nextDir.current = { x:  1, y: 0 };
      if (e.key === ' ' || e.key === 'Enter') reset();
    };

    reset();
    window.addEventListener('keydown', onKey);

    // Speed increases with length: starts 110ms, -2ms per segment, min 50ms
    const getInterval = () => Math.max(50, 110 - snake.current.length * 2);
    let intervalId;

    const step = () => {
      dirRef.current = nextDir.current;
      const head = snake.current[0];
      const next = {
        x: (head.x + dirRef.current.x + SIZE) % SIZE,
        y: (head.y + dirRef.current.y + SIZE) % SIZE,
      };

      if (snake.current.some(p => p.x === next.x && p.y === next.y)) {
        setHiscore(h => Math.max(h, scoreRef.current));
        setDead(true);
        clearInterval(intervalId);

        // Flash dead
        ctx.fillStyle = 'rgba(255,40,40,0.18)';
        ctx.fillRect(0, 0, W, H);
        return;
      }

      const ate = next.x === food.current.x && next.y === food.current.y;
      snake.current = [next, ...snake.current];
      if (ate) {
        scoreRef.current += 10;
        setScore(scoreRef.current);
        placeFood();
        // Restart with new speed
        clearInterval(intervalId);
        intervalId = setInterval(step, getInterval());
      } else {
        snake.current.pop();
      }

      // ── draw ──────────────────────────────────────────────────────────────
      // Background grid
      ctx.fillStyle = '#04060e';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(0,255,255,0.04)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= SIZE; i++) {
        ctx.beginPath(); ctx.moveTo(i*TILE, 0); ctx.lineTo(i*TILE, H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i*TILE); ctx.lineTo(W, i*TILE); ctx.stroke();
      }

      // Food — glowing diamond
      const fx = food.current.x * TILE + TILE/2;
      const fy = food.current.y * TILE + TILE/2;
      ctx.save();
      ctx.shadowBlur = 18; ctx.shadowColor = '#ff44ff';
      ctx.fillStyle = '#ff44ff';
      ctx.beginPath();
      ctx.moveTo(fx, fy - 7); ctx.lineTo(fx + 6, fy);
      ctx.lineTo(fx, fy + 7); ctx.lineTo(fx - 6, fy);
      ctx.closePath(); ctx.fill();
      ctx.restore();

      // Snake body
      snake.current.forEach((part, i) => {
        const t = i / Math.max(snake.current.length - 1, 1);
        const rx = part.x * TILE + 2;
        const ry = part.y * TILE + 2;
        const rs = TILE - 4;
        if (i === 0) {
          // Head — bright cyan with glow
          ctx.save();
          ctx.shadowBlur = 14; ctx.shadowColor = '#00ffff';
          ctx.fillStyle = '#00ffff';
          roundRect(ctx, rx, ry, rs, rs, 4);
          ctx.fill();
          ctx.restore();
          // Eyes
          const ex = part.x * TILE + TILE/2;
          const ey = part.y * TILE + TILE/2;
          ctx.fillStyle = '#001020';
          ctx.beginPath(); ctx.arc(ex - 3, ey - 2, 2, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(ex + 3, ey - 2, 2, 0, Math.PI*2); ctx.fill();
        } else {
          // Body — gradient cyan→blue based on position
          const hue = Math.floor(180 + t * 60); // 180 (cyan) → 240 (blue)
          ctx.fillStyle = `hsl(${hue},100%,${55 - t * 20}%)`;
          roundRect(ctx, rx, ry, rs, rs, 3);
          ctx.fill();
        }
      });

      drawScanlines(ctx, W, H);
    };

    intervalId = setInterval(step, getInterval());
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('keydown', onKey);
    };
  }, [active]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between font-orbitron text-xs tracking-[0.22em]">
        <span className="text-cyan-300">SCORE <span className="text-white">{score}</span></span>
        <span className="flex items-center gap-1 text-yellow-400"><Trophy size={12} /> {hiscore}</span>
        <span className="text-white/45">↑ ↓ ← → · SPACE=RESET</span>
      </div>
      {dead && (
        <p className="text-center font-orbitron text-xs tracking-[0.3em] text-red-400 animate-pulse">
          GAME OVER · SPACE / ENTER to restart
        </p>
      )}
      <canvas
        ref={canvasRef}
        className="mx-auto block rounded-xl border border-cyan-400/30 bg-black shadow-[0_0_30px_rgba(0,255,255,0.14)] [image-rendering:pixelated]"
        style={{ width: '320px', height: '320px' }}
      />
    </div>
  );
}

/* ════════════════════════════════════ PONG ══════════════════════════════════ */
function PongGame({ active }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState({ left: 0, right: 0 });

  useEffect(() => {
    if (!active) return;
    const W = 480, H = 280;
    const canvas = canvasRef.current;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    const PADDLE_W = 10, PADDLE_H = 60;
    const BALL_R = 7;
    const MAX_SPEED = 14;

    const state = {
      leftY: (H - PADDLE_H) / 2,
      rightY: (H - PADDLE_H) / 2,
      ballX: W / 2, ballY: H / 2,
      ballVX: 6.5, ballVY: 4.2,
      up: false, down: false,
      trail: [],
    };
    let frameId;

    const resetBall = (dir = 1) => {
      state.ballX = W / 2; state.ballY = H / 2;
      const speed = 6.5;
      state.ballVX = speed * dir;
      state.ballVY = (Math.random() * 2.5 + 2) * (Math.random() > 0.5 ? 1 : -1);
      state.trail = [];
    };

    const onKeyDown = (e) => {
      if (e.key === 'ArrowUp')   state.up   = true;
      if (e.key === 'ArrowDown') state.down = true;
    };
    const onKeyUp = (e) => {
      if (e.key === 'ArrowUp')   state.up   = false;
      if (e.key === 'ArrowDown') state.down = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup',   onKeyUp);

    const render = () => {
      // Player paddle
      const SPEED = 9;
      if (state.up)   state.leftY -= SPEED;
      if (state.down) state.leftY += SPEED;
      state.leftY = Math.max(0, Math.min(H - PADDLE_H, state.leftY));

      // AI — tracks ball with slight delay and imperfection
      const target = state.ballY - PADDLE_H / 2;
      const aiSpeed = 7.2;
      const diff = target - state.rightY;
      state.rightY += Math.sign(diff) * Math.min(Math.abs(diff) * 0.22, aiSpeed);
      state.rightY = Math.max(0, Math.min(H - PADDLE_H, state.rightY));

      // Ball move
      state.ballX += state.ballVX;
      state.ballY += state.ballVY;

      // Trail
      state.trail.push({ x: state.ballX, y: state.ballY });
      if (state.trail.length > 8) state.trail.shift();

      // Wall bounce
      if (state.ballY - BALL_R <= 0)       { state.ballY = BALL_R;       state.ballVY = Math.abs(state.ballVY); }
      if (state.ballY + BALL_R >= H)        { state.ballY = H - BALL_R;   state.ballVY = -Math.abs(state.ballVY); }

      // Paddle bounce — left
      if (state.ballX - BALL_R <= 18 + PADDLE_W &&
          state.ballX - BALL_R >= 18 &&
          state.ballY >= state.leftY && state.ballY <= state.leftY + PADDLE_H) {
        state.ballVX = Math.min(Math.abs(state.ballVX) * 1.07, MAX_SPEED);
        const offset = (state.ballY - (state.leftY + PADDLE_H / 2)) / (PADDLE_H / 2);
        state.ballVY = offset * 7;
        state.trail = [];
      }

      // Paddle bounce — right
      if (state.ballX + BALL_R >= W - 18 - PADDLE_W &&
          state.ballX + BALL_R <= W - 18 &&
          state.ballY >= state.rightY && state.ballY <= state.rightY + PADDLE_H) {
        state.ballVX = -Math.min(Math.abs(state.ballVX) * 1.07, MAX_SPEED);
        const offset = (state.ballY - (state.rightY + PADDLE_H / 2)) / (PADDLE_H / 2);
        state.ballVY = offset * 7;
        state.trail = [];
      }

      // Score
      if (state.ballX < 0)  { setScore(s => ({ ...s, right: s.right + 1 })); resetBall(1); }
      if (state.ballX > W)  { setScore(s => ({ ...s, left:  s.left  + 1 })); resetBall(-1); }

      // ── draw ──────────────────────────────────────────────────────────────
      ctx.fillStyle = '#04060e';
      ctx.fillRect(0, 0, W, H);

      // Center line
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.setLineDash([8, 10]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(W/2, 0); ctx.lineTo(W/2, H); ctx.stroke();
      ctx.setLineDash([]);

      // Ball trail
      state.trail.forEach((p, i) => {
        const a = (i / state.trail.length) * 0.35;
        ctx.beginPath();
        ctx.arc(p.x, p.y, BALL_R * (i / state.trail.length), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,200,255,${a})`;
        ctx.fill();
      });

      // Ball
      ctx.save();
      ctx.shadowBlur = 18; ctx.shadowColor = '#ffffff';
      ctx.fillStyle  = '#ffffff';
      ctx.beginPath(); ctx.arc(state.ballX, state.ballY, BALL_R, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // Left paddle (cyan)
      ctx.save();
      ctx.shadowBlur = 16; ctx.shadowColor = '#00ffff';
      ctx.fillStyle  = '#00ffff';
      roundRect(ctx, 18, state.leftY, PADDLE_W, PADDLE_H, 4);
      ctx.fill();
      ctx.restore();

      // Right paddle (magenta)
      ctx.save();
      ctx.shadowBlur = 16; ctx.shadowColor = '#ff44ff';
      ctx.fillStyle  = '#ff44ff';
      roundRect(ctx, W - 18 - PADDLE_W, state.rightY, PADDLE_W, PADDLE_H, 4);
      ctx.fill();
      ctx.restore();

      drawScanlines(ctx, W, H);
      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup',   onKeyUp);
    };
  }, [active]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between font-orbitron text-xs tracking-[0.22em]">
        <span className="text-cyan-300">YOU  <span className="text-white text-base">{score.left}</span></span>
        <span className="text-white/45">↑ ↓ to move</span>
        <span className="text-fuchsia-300">CPU  <span className="text-white text-base">{score.right}</span></span>
      </div>
      <canvas
        ref={canvasRef}
        className="mx-auto block w-full max-w-[480px] rounded-xl border border-cyan-400/30 bg-black shadow-[0_0_30px_rgba(0,255,255,0.12)]"
      />
    </div>
  );
}

/* ════════════════════════════════════ BREAKOUT ══════════════════════════════ */
const BROW_COLORS = ['#ff4040', '#ff8800', '#ffdd00', '#44ff88', '#00ccff', '#cc44ff'];

function BreakoutGame({ active }) {
  const canvasRef = useRef(null);
  const [score, setScore]   = useState(0);
  const [hiscore, setHiscore] = useState(0);
  const [level, setLevel]   = useState(1);

  useEffect(() => {
    if (!active) return;
    const W = 480, H = 320;
    const canvas = canvasRef.current;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    const COLS = 8, ROWS = 5;
    const BRICK_W = 52, BRICK_H = 18, BRICK_PAD = 5;
    const BOFF_X = (W - COLS * (BRICK_W + BRICK_PAD) + BRICK_PAD) / 2;
    const BOFF_Y = 28;
    const PAD_W = 80, PAD_H = 10, BALL_R = 7;

    let scoreVal = 0, lvl = 1;

    const makeBricks = () =>
      Array.from({ length: ROWS * COLS }, (_, i) => ({
        x: BOFF_X + (i % COLS) * (BRICK_W + BRICK_PAD),
        y: BOFF_Y + Math.floor(i / COLS) * (BRICK_H + BRICK_PAD),
        row: Math.floor(i / COLS),
        alive: true,
      }));

    const state = {
      padX: (W - PAD_W) / 2,
      ballX: W / 2, ballY: H - 60,
      ballVX: 5.5, ballVY: -5.5,
      left: false, right: false,
      bricks: makeBricks(),
    };
    let frameId;

    const reset = (nextLvl = 1) => {
      lvl = nextLvl;
      scoreVal = 0;
      setScore(0); setLevel(lvl);
      const spd = 5.5 + (lvl - 1) * 0.8;
      state.padX  = (W - PAD_W) / 2;
      state.ballX = W / 2; state.ballY = H - 60;
      state.ballVX = spd; state.ballVY = -spd;
      state.bricks = makeBricks();
    };

    const onKeyDown = (e) => {
      if (e.key === 'ArrowLeft')  state.left  = true;
      if (e.key === 'ArrowRight') state.right = true;
      if (e.key === ' ' || e.key === 'Enter') reset(1);
    };
    const onKeyUp = (e) => {
      if (e.key === 'ArrowLeft')  state.left  = false;
      if (e.key === 'ArrowRight') state.right = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup',   onKeyUp);

    const render = () => {
      const PAD_SPEED = 11;
      if (state.left)  state.padX -= PAD_SPEED;
      if (state.right) state.padX += PAD_SPEED;
      state.padX = Math.max(0, Math.min(W - PAD_W, state.padX));

      state.ballX += state.ballVX;
      state.ballY += state.ballVY;

      // Wall bounce
      if (state.ballX - BALL_R <= 0)    { state.ballX = BALL_R;      state.ballVX =  Math.abs(state.ballVX); }
      if (state.ballX + BALL_R >= W)    { state.ballX = W - BALL_R;  state.ballVX = -Math.abs(state.ballVX); }
      if (state.ballY - BALL_R <= 0)    { state.ballY = BALL_R;      state.ballVY =  Math.abs(state.ballVY); }

      // Paddle bounce
      if (state.ballY + BALL_R >= H - 40 &&
          state.ballY + BALL_R <= H - 30 &&
          state.ballX >= state.padX &&
          state.ballX <= state.padX + PAD_W) {
        const hit = (state.ballX - (state.padX + PAD_W / 2)) / (PAD_W / 2);
        const spd = Math.hypot(state.ballVX, state.ballVY);
        state.ballVX = hit * Math.min(spd * 1.05, 14);
        state.ballVY = -Math.abs(state.ballVY) * 1.02;
      }

      // Death
      if (state.ballY > H + 20) { setHiscore(h => Math.max(h, scoreVal)); reset(1); frameId = requestAnimationFrame(render); return; }

      // Brick collision
      state.bricks.forEach(b => {
        if (!b.alive) return;
        if (state.ballX + BALL_R > b.x && state.ballX - BALL_R < b.x + BRICK_W &&
            state.ballY + BALL_R > b.y && state.ballY - BALL_R < b.y + BRICK_H) {
          b.alive = false;
          state.ballVY *= -1;
          scoreVal += (ROWS - b.row) * 10;
          setScore(scoreVal);
        }
      });

      // Level clear
      if (state.bricks.every(b => !b.alive)) {
        reset(lvl + 1);
        frameId = requestAnimationFrame(render);
        return;
      }

      // ── draw ──────────────────────────────────────────────────────────────
      ctx.fillStyle = '#04060e';
      ctx.fillRect(0, 0, W, H);

      // Bricks
      state.bricks.forEach(b => {
        if (!b.alive) return;
        const c = BROW_COLORS[b.row % BROW_COLORS.length];
        ctx.save();
        ctx.shadowBlur = 8; ctx.shadowColor = c;
        ctx.fillStyle  = c;
        roundRect(ctx, b.x, b.y, BRICK_W, BRICK_H, 4);
        ctx.fill();
        // Shine
        ctx.fillStyle = 'rgba(255,255,255,0.14)';
        roundRect(ctx, b.x + 2, b.y + 2, BRICK_W - 4, 5, 2);
        ctx.fill();
        ctx.restore();
      });

      // Paddle
      ctx.save();
      ctx.shadowBlur = 16; ctx.shadowColor = '#00ffff';
      const padGrad = ctx.createLinearGradient(state.padX, 0, state.padX + PAD_W, 0);
      padGrad.addColorStop(0, '#00aaff');
      padGrad.addColorStop(0.5, '#00ffff');
      padGrad.addColorStop(1, '#00aaff');
      ctx.fillStyle = padGrad;
      roundRect(ctx, state.padX, H - 42, PAD_W, PAD_H, 4);
      ctx.fill();
      ctx.restore();

      // Ball
      ctx.save();
      ctx.shadowBlur = 18; ctx.shadowColor = '#ffffff';
      ctx.fillStyle  = '#ffffff';
      ctx.beginPath(); ctx.arc(state.ballX, state.ballY, BALL_R, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      drawScanlines(ctx, W, H);
      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup',   onKeyUp);
    };
  }, [active]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between font-orbitron text-xs tracking-[0.22em]">
        <span className="text-cyan-300">SCORE <span className="text-white">{score}</span></span>
        <span className="text-yellow-400">LVL {level}</span>
        <span className="flex items-center gap-1 text-yellow-400"><Trophy size={12} /> {hiscore}</span>
        <span className="text-white/45">← → · SPACE=RESET</span>
      </div>
      <canvas
        ref={canvasRef}
        className="mx-auto block w-full max-w-[480px] rounded-xl border border-cyan-400/30 bg-black shadow-[0_0_30px_rgba(0,255,255,0.12)]"
      />
    </div>
  );
}

/* ════════════════════════════════════ MODAL ═════════════════════════════════ */
export default function ArcadeGamesModal({ open, onClose }) {
  const [activeGame, setActiveGame] = useState('snake');

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
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
          className="fixed inset-0 z-[140] flex items-center justify-center px-4"
          style={{ background: 'rgba(0,3,15,0.92)', backdropFilter: 'blur(20px)' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            className="relative w-full max-w-[640px] overflow-hidden rounded-[28px] border border-cyan-400/25"
            style={{
              background: 'linear-gradient(160deg, rgba(3,6,22,0.99) 0%, rgba(0,12,28,0.97) 100%)',
              boxShadow: '0 0 80px rgba(0,255,255,0.12), 0 0 160px rgba(0,255,255,0.05)',
            }}
          >
            {/* Scanlines overlay */}
            <div
              className="pointer-events-none absolute inset-0 z-0 opacity-[0.035]"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,#fff 2px,#fff 4px)' }}
            />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/8 px-6 py-4">
              <div>
                <p className="font-rajdhani text-[10px] font-bold uppercase tracking-[0.5em] text-cyan-400/70">NEXUS ARCADE · MINIGAMES</p>
                <h2 className="font-orbitron text-xl font-black tracking-[0.16em] text-white sm:text-2xl" style={{ textShadow: '0 0 20px rgba(0,255,255,0.4)' }}>
                  NEXUS PLAY
                </h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:border-cyan-400/40 hover:text-cyan-300"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tab bar */}
            <div className="relative z-10 flex gap-2 px-6 py-3">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveGame(tab.id)}
                  className="relative rounded-full px-5 py-2 font-orbitron text-[10px] font-bold tracking-[0.3em] transition-all"
                  style={activeGame === tab.id ? {
                    background: 'rgba(0,255,255,0.12)',
                    border: '1px solid rgba(0,255,255,0.4)',
                    color: '#00ffff',
                    boxShadow: '0 0 14px rgba(0,255,255,0.25)',
                  } : {
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.55)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Game area */}
            <div className="relative z-10 px-6 pb-6">
              {activeGame === 'snake'    && <SnakeGame    active={open && activeGame === 'snake'}    />}
              {activeGame === 'pong'     && <PongGame     active={open && activeGame === 'pong'}     />}
              {activeGame === 'breakout' && <BreakoutGame active={open && activeGame === 'breakout'} />}
              <p className="mt-4 text-center font-rajdhani text-sm font-bold uppercase tracking-[0.2em] text-white/35">
                ESC · Volver al mundo
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
