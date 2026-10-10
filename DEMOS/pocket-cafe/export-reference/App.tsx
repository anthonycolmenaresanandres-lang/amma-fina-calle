// tslint:disable
/* eslint-disable */
import {
  Activity,
  Award,
  ChevronRight,
  Gamepad,
  HelpCircle,
  Home,
  Info,
  Move,
  Pause,
  Play,
  RotateCw,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {CONFIG, getConfig} from './constants';
import {Game} from './Game';
import {GROWTH_TIERS} from './gameplay';
import {LEVELS} from './levels';
import {AVAILABLE_SKINS, getSkinConfig} from './skins';
import {ObjectTier} from './types';
import {
  GameState,
  MenuOverlay,
  Overlay,
  formatTime,
  gameAudio,
  useAutoFocus,
  useIsMobile,
} from './utils';
import BackgroundMusic from './utils/BackgroundMusic';
import {
  usePlayground,
  usePlaygroundGameLifecycle,
  useRpc,
} from './utils/usePlayground';

interface CustomWindow extends Window {
  canHandleBackKey?: boolean;
}

// Mobile Dynamic Floating Touch Surface for 360-degree Collector Steering
function MobileTouchController({
  onVectorChange,
}: {
  onVectorChange: (vec: {x: number; y: number}) => void;
}) {
  const [touchData, setTouchData] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  const activePointerId = useRef<number | null>(null);
  const maxRadius = 48;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    activePointerId.current = e.pointerId;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setTouchData({
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
    });
    onVectorChange({x: 0, y: 0});
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== e.pointerId || !touchData) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const curX = e.clientX - rect.left;
    const curY = e.clientY - rect.top;

    const dx = curX - touchData.startX;
    const dy = curY - touchData.startY;
    const dist = Math.hypot(dx, dy);

    let clampedX = dx;
    let clampedY = dy;
    if (dist > maxRadius) {
      clampedX = (dx / dist) * maxRadius;
      clampedY = (dy / dist) * maxRadius;
    }

    setTouchData((prev) =>
      prev
        ? {
            ...prev,
            currentX: prev.startX + clampedX,
            currentY: prev.startY + clampedY,
          }
        : null,
    );

    // Normalize -1..1
    onVectorChange({
      x: clampedX / maxRadius,
      y: clampedY / maxRadius,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current === e.pointerId) {
      activePointerId.current = null;
      setTouchData(null);
      onVectorChange({x: 0, y: 0});
    }
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="absolute inset-0 z-20 touch-none select-none pointer-events-auto">
      {/* Visual Dynamic Thumb Stick Indicator */}
      {touchData ? (
        <div
          style={{
            left: `${touchData.startX}px`,
            top: `${touchData.startY}px`,
            transform: 'translate(-50%, -50%)',
          }}
          className="absolute w-24 h-24 rounded-full bg-zinc-950/70 border-2 border-amber-400/80 backdrop-blur-sm pointer-events-none shadow-2xl flex items-center justify-center">
          {/* Thumb Knob */}
          <div
            style={{
              transform: `translate(${touchData.currentX - touchData.startX}px, ${touchData.currentY - touchData.startY}px)`,
            }}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-white shadow-xl pointer-events-none"
          />
        </div>
      ) : (
        /* Idle touch hint badge on bottom left of screen */
        <div className="absolute bottom-6 left-8 bg-zinc-900/80 backdrop-blur-md border border-zinc-700/70 px-4 py-2 rounded-2xl flex items-center gap-2 text-zinc-300 text-xs font-semibold shadow-lg pointer-events-none animate-pulse">
          <Move size={16} className="text-amber-400" />
          <span>Touch &amp; drag anywhere to steer</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const {sdk, isReady} = usePlayground();
  const [exitChat] = useRpc<Record<string, unknown>, void>('ExitChat');
  const isMobile = useIsMobile();

  // Primary Game State Machine
  const [gameState, setGameState] = useState<GameState>({
    status: 'START',
    score: 0,
    level: 1,
    timer: 60,
  });

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // Swappable Skin ID
  const [selectedSkinId, setSelectedSkinId] = useState<string>('park');
  const currentSkin = getSkinConfig(selectedSkinId);

  // Virtual Joystick & Drag Vector State
  const [joystickVector, setJoystickVector] = useState<{x: number; y: number}>({
    x: 0,
    y: 0,
  });

  // Overlay Popups State
  const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [howToPlayCaller, setHowToPlayCaller] = useState<'main' | 'game'>('main');

  // Audio mute toggles
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [isSfxMuted, setIsSfxMuted] = useState(false);

  // Growth & UI feedback state
  const [currentTier, setCurrentTier] = useState<ObjectTier>(1);
  const [tierTitle, setTierTitle] = useState<string>('Micro Collector');
  const [tierUpToast, setTierUpToast] = useState<string | null>(null);
  const [floatingPoints, setFloatingPoints] = useState<
    {id: number; text: string}[]
  >([]);

  const [gameKey, setGameKey] = useState(0);

  // Auto back-key safety cast
  useEffect(() => {
    (window as unknown as Record<string, unknown>).canHandleBackKey = [
      'PLAYING',
      'PAUSED',
    ].includes(gameState.status);
  }, [gameState.status]);

  // Keyboard shortcut: Escape toggles menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isHowToPlayOpen) {
          setIsHowToPlayOpen(false);
          return;
        }
        if (gameState.status === 'PLAYING') {
          setIsGameMenuOpen((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.status, isHowToPlayOpen]);

  // Start / Restart game logic
  const startGame = useCallback(
    (levelNum = 1) => {
      gameAudio.playConfirmSelect();
      setGameState({
        status: 'PLAYING',
        score: 0,
        level: levelNum,
        timer: LEVELS[(levelNum - 1) % LEVELS.length].timeLimit,
      });
      setCurrentTier(1);
      setTierTitle(GROWTH_TIERS[0].title);
      setTierUpToast(null);
      setIsGameMenuOpen(false);
      setIsHowToPlayOpen(false);
      setJoystickVector({x: 0, y: 0});
      setGameKey((prev) => prev + 1);

      if (sdk) {
        sdk.startGame();
      }
    },
    [sdk],
  );

  // Lifecycle SDK integration
  usePlaygroundGameLifecycle(gameState, sdk);

  // Status Sound effects trigger
  useEffect(() => {
    if (gameState.status === 'GAME_OVER') {
      gameAudio.playDefeatMotif();
    } else if (
      gameState.status === 'VICTORY' ||
      gameState.status === 'LEVEL_COMPLETE'
    ) {
      gameAudio.playVictoryFanfare();
    }
  }, [gameState.status]);

  // Round completion logic (60s timer expires)
  const handleRoundTimeEnd = useCallback(() => {
    const currentLevelSpec = LEVELS[(gameState.level - 1) % LEVELS.length];
    if (gameState.score >= currentLevelSpec.targetScore) {
      if (gameState.level >= LEVELS.length) {
        setGameState((prev) => ({...prev, status: 'VICTORY'}));
      } else {
        setGameState((prev) => ({...prev, status: 'LEVEL_COMPLETE'}));
      }
    } else {
      setGameState((prev) => ({...prev, status: 'GAME_OVER'}));
    }
  }, [gameState.score, gameState.level]);

  // Tier level up feedback
  const handleTierChange = useCallback((newTier: ObjectTier, title: string) => {
    setCurrentTier(newTier);
    setTierTitle(title);
    setTierUpToast(`TIER ${newTier} UNLOCKED: ${title}!`);
    setTimeout(() => {
      setTierUpToast(null);
    }, 2500);
  }, []);

  // Floating point bubble feedback
  const handleItemCollected = useCallback((points: number, symbol: string) => {
    const id = Date.now() + Math.random();
    setFloatingPoints((prev) => [...prev.slice(-4), {id, text: `+${points} ${symbol}`}]);
    setTimeout(() => {
      setFloatingPoints((prev) => prev.filter((p) => p.id !== id));
    }, 1200);
  }, []);

  const currentLevelSpec = LEVELS[(gameState.level - 1) % LEVELS.length];
  const targetScore = currentLevelSpec?.targetScore || 2000;
  const progressPercent = Math.min(
    100,
    Math.round((gameState.score / targetScore) * 100),
  );

  const isMusicActive =
    ['PLAYING', 'PAUSED', 'LEVEL_COMPLETE'].includes(gameState.status) &&
    !isGameMenuOpen;

  const startBtnRef = useAutoFocus<HTMLButtonElement>(
    gameState.status === 'START',
  );

  return (
    <div
      style={{
        paddingTop: 'max(0px, env(safe-area-inset-top))',
        paddingBottom: 'max(0px, env(safe-area-inset-bottom))',
        paddingLeft: 'max(0px, env(safe-area-inset-left))',
        paddingRight: 'max(0px, env(safe-area-inset-right))',
      }}
      className="fixed inset-0 overflow-hidden touch-none flex flex-col bg-zinc-950 text-white font-sans select-none">
      {/* Background BGM Player */}
      <BackgroundMusic
        url={getConfig('backgroundMusicUrl') as string}
        isPlaying={isMusicActive}
        isMuted={isMusicMuted}
        volume={getConfig('defaultMusicVolume') as number}
      />

      {/* Top HUD Bar with Safe Area Spacing */}
      {gameState.status === 'PLAYING' && (
        <header className="w-full flex items-center justify-between px-3 md:px-6 py-2 bg-zinc-900/90 border-b border-zinc-800/80 backdrop-blur-md z-30 shrink-0 select-none">
          {/* Left HUD: Level & Score */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
                Lvl {gameState.level} &bull; {currentLevelSpec.name}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-base md:text-xl font-black text-amber-400 tracking-tight">
                  {gameState.score.toLocaleString()}
                </span>
                <span className="text-[9px] md:text-[10px] text-zinc-400">
                  /{targetScore.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Target Progress Bar */}
            <div className="hidden sm:flex flex-col w-20 md:w-28">
              <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-300"
                  style={{width: `${progressPercent}%`}}
                />
              </div>
              <span className="text-[9px] text-right text-zinc-400 font-mono mt-0.5">
                {progressPercent}%
              </span>
            </div>
          </div>

          {/* Center HUD: Countdown Timer & Tier */}
          <div className="flex items-center gap-2">
            <div
              className={`px-2.5 md:px-3 py-1 rounded-full border flex items-center gap-1.5 shadow-sm ${
                (gameState.timer ?? 60) <= 10
                  ? 'bg-red-950/80 border-red-500 text-red-300 animate-pulse'
                  : 'bg-zinc-800/80 border-zinc-700 text-zinc-200'
              }`}>
              <Activity size={14} className="text-amber-400" />
              <span className="font-mono text-xs md:text-sm font-bold">
                {formatTime(gameState.timer ?? 60)}
              </span>
            </div>

            <div className="px-2 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[11px] font-semibold flex items-center gap-1">
              <Zap size={12} />
              <span>T{currentTier}</span>
            </div>
          </div>

          {/* Right Top Corner: Strictly 48px Min Touch Target Menu Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                gameAudio.playCrispClick();
                setIsGameMenuOpen(true);
              }}
              data-testid="menu-button"
              className="min-w-[48px] min-h-[48px] px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 border border-zinc-600 text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md">
              <Pause size={15} />
              <span className="hidden xs:inline">Menu</span>
            </button>
          </div>
        </header>
      )}

      {/* Main 3D Canvas Area */}
      <main className="flex-1 w-full min-h-0 relative flex items-center justify-center">
        <Game
          key={gameKey}
          gameState={gameState}
          setGameState={setGameState}
          exitChat={exitChat}
          gameStateRef={gameStateRef}
          selectedSkinId={selectedSkinId}
          joystickVector={joystickVector}
          onTierChange={handleTierChange}
          onItemCollected={handleItemCollected}
          onRoundTimeEnd={handleRoundTimeEnd}
        />

        {/* Floating Item Points Animation */}
        {gameState.status === 'PLAYING' && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center gap-1 z-20">
            {floatingPoints.map((item) => (
              <div
                key={item.id}
                className="text-xs md:text-sm font-black text-amber-300 bg-black/60 px-2.5 py-0.5 rounded-full border border-amber-400/40 shadow-lg animate-bounce">
                {item.text}
              </div>
            ))}
          </div>
        )}

        {/* Tier Up Notification Toast */}
        {tierUpToast && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 font-black px-4 py-1.5 md:px-5 md:py-2 rounded-2xl shadow-2xl border-2 border-white text-xs md:text-sm uppercase tracking-wider animate-pulse z-30 pointer-events-none text-center whitespace-nowrap">
            {tierUpToast}
          </div>
        )}

        {/* Full-Screen Dynamic Touch Control for Mobile */}
        {isMobile && gameState.status === 'PLAYING' && !isGameMenuOpen && (
          <MobileTouchController onVectorChange={setJoystickVector} />
        )}
      </main>

      {/* --- MODAL OVERLAYS (Decoupled Scrolling & Responsive Safe Zones) --- */}

      {/* 1. START SCREEN */}
      {gameState.status === 'START' && (
        <MenuOverlay tone="neutral" zIndex={50}>
          <div className="w-full max-w-md bg-zinc-900/95 border border-zinc-700/80 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col items-center my-auto">
            {/* Title & Badge */}
            <div className="flex items-center gap-2 mb-2 text-[11px] font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
              <Sparkles size={13} /> 3D Arena Growth Sprint
            </div>

            <h1 className="text-2xl md:text-4xl font-black text-center text-white tracking-tight mb-2">
              Pocket Collector
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 text-center mb-5 leading-relaxed">
              Steer your circular collector to swallow props smaller than your
              radius. Grow across 5 tiers and clear the arena before the 60s
              countdown expires!
            </p>

            {/* Reusable Skin Switcher */}
            <div className="w-full mb-4 bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                <span>Select Theme / Skin:</span>
                <span className="text-amber-400 font-mono text-[9px]">
                  Zero Code Swapping
                </span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(AVAILABLE_SKINS).map((skin) => (
                  <button
                    key={skin.id}
                    onClick={() => {
                      gameAudio.playCrispClick();
                      setSelectedSkinId(skin.id);
                    }}
                    className={`min-w-[48px] min-h-[48px] p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                      selectedSkinId === skin.id
                        ? 'bg-amber-400 text-zinc-950 border-amber-300 shadow-md scale-[1.02]'
                        : 'bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                    }`}>
                    <span>{skin.themeBadge}</span>
                    <span className="text-[9px] opacity-80">{skin.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Level Selection Pills */}
            <div className="w-full mb-5 flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Select Starting Level:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {LEVELS.map((lvl) => (
                  <button
                    key={lvl.levelNumber}
                    onClick={() => {
                      gameAudio.playCrispClick();
                      setGameState((prev) => ({...prev, level: lvl.levelNumber}));
                    }}
                    className={`min-w-[48px] min-h-[48px] py-2 px-1 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center ${
                      gameState.level === lvl.levelNumber
                        ? 'bg-cyan-500 text-zinc-950 border-cyan-300 shadow'
                        : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                    }`}>
                    <span>Lvl {lvl.levelNumber}</span>
                    <span className="text-[9px] opacity-80 truncate max-w-[70px]">
                      {lvl.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-2.5">
              <button
                ref={startBtnRef}
                autoFocus
                onClick={() => startGame(gameState.level || 1)}
                data-testid="start-button"
                className="min-w-[48px] min-h-[48px] w-full bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 active:scale-95 text-zinc-950 py-3 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-xl transition-transform">
                <Play size={20} />
                START 60s ROUND
              </button>

              <button
                onClick={() => {
                  gameAudio.playCrispClick();
                  setHowToPlayCaller('main');
                  setIsHowToPlayOpen(true);
                }}
                className="min-w-[48px] min-h-[48px] w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border border-zinc-700 transition-colors">
                <HelpCircle size={16} />
                How to Play &amp; Rules
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* 2. GAME MENU / PAUSE OVERLAY */}
      {isGameMenuOpen && (
        <MenuOverlay tone="neutral" zIndex={60}>
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col items-center my-auto">
            <h2 className="text-2xl font-black text-amber-400 mb-1">
              Game Menu
            </h2>
            <p className="text-xs text-zinc-400 mb-4">
              Round Paused &bull; Level {gameState.level}
            </p>

            {/* Audio Settings Toggles */}
            <div className="w-full bg-zinc-950 p-3 rounded-2xl border border-zinc-800 mb-4 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Audio Controls:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const newMute = !isMusicMuted;
                    setIsMusicMuted(newMute);
                    gameAudio.playCrispClick();
                  }}
                  className={`min-w-[48px] min-h-[48px] px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                    !isMusicMuted
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                  }`}>
                  {!isMusicMuted ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  <span>Music: {!isMusicMuted ? 'ON' : 'MUTED'}</span>
                </button>

                <button
                  onClick={() => {
                    const newMuted = gameAudio.toggleMute();
                    setIsSfxMuted(newMuted);
                  }}
                  className={`min-w-[48px] min-h-[48px] px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                    !isSfxMuted
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                  }`}>
                  {!isSfxMuted ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  <span>SFX: {!isSfxMuted ? 'ON' : 'MUTED'}</span>
                </button>
              </div>
            </div>

            {/* In-Game Skin Switcher */}
            <div className="w-full bg-zinc-950 p-3 rounded-2xl border border-zinc-800 mb-4 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Switch Theme (Live):
              </span>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(AVAILABLE_SKINS).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      gameAudio.playCrispClick();
                      setSelectedSkinId(s.id);
                    }}
                    className={`min-w-[48px] min-h-[48px] p-2 rounded-xl border text-xs font-bold transition-all ${
                      selectedSkinId === s.id
                        ? 'bg-amber-400 text-zinc-950 border-amber-300 font-black'
                        : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                    }`}>
                    {s.themeBadge}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Action List */}
            <div className="w-full flex flex-col gap-2">
              <button
                onClick={() => {
                  gameAudio.playCrispClick();
                  setIsGameMenuOpen(false);
                }}
                className="min-w-[48px] min-h-[48px] w-full bg-amber-400 hover:bg-amber-300 text-zinc-950 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg">
                <Play size={18} />
                RESUME ROUND
              </button>

              <button
                onClick={() => {
                  startGame(gameState.level);
                }}
                className="min-w-[48px] min-h-[48px] w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-zinc-700">
                <RotateCw size={16} />
                Restart Level {gameState.level}
              </button>

              <button
                onClick={() => {
                  gameAudio.playCrispClick();
                  setHowToPlayCaller('game');
                  setIsHowToPlayOpen(true);
                }}
                className="min-w-[48px] min-h-[48px] w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-zinc-700">
                <HelpCircle size={16} />
                How to Play
              </button>

              <button
                onClick={() => {
                  gameAudio.playCrispClick();
                  setIsGameMenuOpen(false);
                  setGameState((prev) => ({...prev, status: 'START'}));
                }}
                className="min-w-[48px] min-h-[48px] w-full bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                <Home size={16} />
                Quit to Main Menu
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* 3. HOW TO PLAY OVERLAY */}
      {isHowToPlayOpen && (
        <MenuOverlay tone="neutral" zIndex={70}>
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col items-center my-auto">
            <h2 className="text-2xl font-black text-amber-400 mb-3 flex items-center gap-2">
              <Info size={22} />
              How to Play
            </h2>

            <div className="w-full flex flex-col gap-2.5 text-xs text-zinc-300 mb-5 bg-zinc-950 p-4 rounded-2xl border border-zinc-800 leading-relaxed overflow-y-auto max-h-[50vh]">
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold text-sm">1.</span>
                <div>
                  <strong className="text-white">Steer Your Collector:</strong>{' '}
                  {isMobile
                    ? 'Touch and drag anywhere on the screen to glide your collector around.'
                    : 'Use WASD / Arrow Keys or click and drag mouse to glide your collector around.'}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold text-sm">2.</span>
                <div>
                  <strong className="text-white">Size Rule &amp; Growth:</strong>{' '}
                  You can only swallow props that are smaller than your current
                  collector radius. Swallowing props expands your capacity!
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold text-sm">3.</span>
                <div>
                  <strong className="text-white">Obstacle Blocking:</strong>{' '}
                  Larger props act as static walls until you achieve the required Tier.
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold text-sm">4.</span>
                <div>
                  <strong className="text-white">60-Second Round:</strong> Reach
                  the target score before the countdown expires to clear the level!
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold text-sm">5.</span>
                <div>
                  <strong className="text-white">Themes:</strong> Swap seamlessly
                  between Park Promenade and Bistro Tabletop in the menu.
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                gameAudio.playCrispClick();
                setIsHowToPlayOpen(false);
              }}
              className="min-w-[48px] min-h-[48px] w-full bg-amber-400 hover:bg-amber-300 text-zinc-950 py-3 rounded-xl font-bold text-sm shadow-lg">
              BACK TO {howToPlayCaller === 'main' ? 'MAIN MENU' : 'GAME'}
            </button>
          </div>
        </MenuOverlay>
      )}

      {/* 4. LEVEL COMPLETE SCREEN */}
      {gameState.status === 'LEVEL_COMPLETE' && (
        <Overlay
          title="STAGE CLEAR!"
          description={`Outstanding! You scored ${gameState.score.toLocaleString()} pts. Ready for Level ${gameState.level + 1}?`}
          actionLabel={`PROCEED TO LEVEL ${gameState.level + 1}`}
          onAction={() => startGame(gameState.level + 1)}
          icon={<ChevronRight size={22} />}
          tone="victory"
        />
      )}

      {/* 5. VICTORY SCREEN */}
      {gameState.status === 'VICTORY' && (
        <Overlay
          title="CHAMPION COLLECTOR!"
          description={`All 3 stages conquered with a grand total of ${gameState.score.toLocaleString()} points! You are the undisputed Cosmic Vortex.`}
          actionLabel="PLAY AGAIN (REPLAY)"
          onAction={() => startGame(1)}
          icon={<Trophy size={22} />}
          tone="victory"
        />
      )}

      {/* 6. GAME OVER SCREEN */}
      {gameState.status === 'GAME_OVER' && (
        <Overlay
          title="TIME'S UP!"
          description={`You collected ${gameState.score.toLocaleString()} pts (Target: ${targetScore.toLocaleString()} pts). Give it another quick sprint!`}
          actionLabel="TRY AGAIN (REPLAY)"
          onAction={() => startGame(gameState.level)}
          icon={<RotateCw size={22} />}
          tone="danger"
        />
      )}
    </div>
  );
}
