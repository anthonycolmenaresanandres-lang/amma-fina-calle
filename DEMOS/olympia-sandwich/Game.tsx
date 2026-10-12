// tslint:disable
/* eslint-disable */
import {FrameProvider,useFrame} from './FrameLoop';
import {CounterPainter} from './CanvasVisuals';

import React, {
  MutableRefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';

import {getConfig} from './constants';
import {
  GROWTH_TIERS,
  LOGICAL_ITEMS,
  clampToArena,
  distanceXZ,
  getTierForMass,
  isItemEligible,
} from './gameplay';
import {InputSnapshot, useInput} from './input';
import {LEVELS, generateLevelItems} from './levels';
import {getSkinConfig} from './skins';
import {ObjectTier, PlacedItem, SkinConfig} from './types';
import {
  GameState,
  gameAudio,
  randomRange,
  tempVec3,
  tempVec3B,
} from './utils';

export interface GameProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  exitChat: (payload: Record<string, unknown>) => Promise<void>;
  gameStateRef: MutableRefObject<GameState>;
  selectedSkinId: string;
  joystickVector?: {x: number; y: number};
  onTierChange?: (newTier: ObjectTier, title: string) => void;
  onItemCollected?: (points: number, symbol: string) => void;
  onRoundTimeEnd?: () => void;
}

interface SceneProps extends GameProps {
  inputRef: MutableRefObject<InputSnapshot>;
}

// Global reusable scratch vectors for allocation-free frame loops
const _moveDir = new THREE.Vector3();
const _camTarget = new THREE.Vector3();
const _camDesired = new THREE.Vector3();

// Inner Scene Container handling loop & interactions
function Scene({
  gameState,
  setGameState,
  inputRef,
  exitChat,
  gameStateRef,
  selectedSkinId,
  joystickVector,
  onTierChange,
  onItemCollected,
  onRoundTimeEnd,
}: SceneProps) {
  const camera = useMemo(() => new THREE.PerspectiveCamera(), []);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const painterRef = useRef<CounterPainter|null>(null);
  useEffect(() => {if (!canvasRef.current) return; const painter = new CounterPainter(canvasRef.current); painterRef.current=painter; return () => {painter.dispose();painterRef.current=null;};}, []);
  const skin = getSkinConfig(selectedSkinId);
  const currentLevelIndex = (gameState.level || 1) - 1;
  const levelSpec = LEVELS[currentLevelIndex % LEVELS.length];

  const itemsRef = useRef<PlacedItem[]>([]);
  const itemMeshesRef = useRef<Record<string, THREE.Group | null>>({});

  const collectorRef = useRef({
    x: 0,
    z: 0,
    mass: 0,
    tier: 1 as ObjectTier,
    radius: GROWTH_TIERS[0].collectorRadius,
    speed: GROWTH_TIERS[0].speed,
  });

  const collectorGroupRef = useRef<THREE.Group>(new THREE.Group());
  const [collectorTier, setCollectorTier] = useState<ObjectTier>(1);
  const [collectorRadius, setCollectorRadius] = useState<number>(
    GROWTH_TIERS[0].collectorRadius,
  );
  const [isTierUpAnimating, setIsTierUpAnimating] = useState(false);

  const timerRef = useRef<number>(levelSpec.timeLimit);
  const lastBlockSoundTimeRef = useRef<number>(0);

  useEffect(() => {
    const generated = generateLevelItems(currentLevelIndex);
    itemsRef.current = generated;
    itemMeshesRef.current = Object.fromEntries(generated.map(item => {
      const group = new THREE.Group();group.position.set(item.x,0,item.z);group.scale.setScalar(item.initialScale);group.rotation.y=item.rotationY;
      return [item.uid,group];
    }));
    collectorRef.current = {
      x: 0,
      z: 0,
      mass: 0,
      tier: 1,
      radius: GROWTH_TIERS[0].collectorRadius,
      speed: GROWTH_TIERS[0].speed,
    };
    setCollectorTier(1);
    setCollectorRadius(GROWTH_TIERS[0].collectorRadius);
    timerRef.current = levelSpec.timeLimit;
    setGameState((prev) => ({
      ...prev,
      timer: levelSpec.timeLimit,
    }));
  }, [currentLevelIndex, setGameState, levelSpec.timeLimit]);

  const lastCancelRef = useRef(false);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const input = inputRef.current;

    if (input) {
      const cancelPressed = input.actions.cancel;
      if (cancelPressed && !lastCancelRef.current) {
        const currentStatus = gameStateRef.current.status;
        if (currentStatus === 'PLAYING') {
          setGameState((prev) => ({...prev, status: 'PAUSED'}));
        } else if (currentStatus === 'PAUSED') {
          setGameState((prev) => ({...prev, status: 'PLAYING'}));
        }
      }
      lastCancelRef.current = cancelPressed;
    }

    if (gameState.status !== 'PLAYING') return;

    // 1. Countdown Timer
    timerRef.current = Math.max(0, timerRef.current - dt);
    const currentTimer = Math.ceil(timerRef.current);
    if (gameStateRef.current.timer !== currentTimer) {
      setGameState((prev) => ({
        ...prev,
        timer: currentTimer,
      }));
    }

    if (timerRef.current <= 0) {
      if (onRoundTimeEnd) {
        onRoundTimeEnd();
      }
      return;
    }

    // 2. Collector Steering Inputs
    _moveDir.set(0, 0, 0);

    // Keyboard action inputs
    if (input?.actions) {
      if (input.actions.left) _moveDir.x -= 1;
      if (input.actions.right) _moveDir.x += 1;
      if (input.actions.up) _moveDir.z -= 1;
      if (input.actions.down) _moveDir.z += 1;
    }

    // Direct Virtual Joystick / Touch Drag inputs
    if (joystickVector && (Math.abs(joystickVector.x) > 0.02 || Math.abs(joystickVector.y) > 0.02)) {
      _moveDir.x += joystickVector.x;
      _moveDir.z += joystickVector.y;
    } else if (input?.joystickVector && (Math.abs(input.joystickVector.x) > 0.02 || Math.abs(input.joystickVector.y) > 0.02)) {
      _moveDir.x += input.joystickVector.x;
      _moveDir.z += input.joystickVector.y;
    }

    const col = collectorRef.current;
    const baseSpeed = (getConfig('collectorBaseSpeed') as number) || 9.0;
    const currentSpeed = (col.speed / 9.0) * baseSpeed;

    if (_moveDir.lengthSq() > 0.001) {
      _moveDir.normalize();
      let proposedX = col.x + _moveDir.x * currentSpeed * dt;
      let proposedZ = col.z + _moveDir.z * currentSpeed * dt;

      const halfW = levelSpec.arenaWidth / 2;
      const halfD = levelSpec.arenaDepth / 2;
      const clamped = clampToArena(
        {x: proposedX, z: proposedZ},
        halfW,
        halfD,
        col.radius * 0.8,
      );

      // Collision blocking against locked (larger) objects
      let blocked = false;
      const items = itemsRef.current;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.collected || item.sinkProgress > 0) continue;

        if (!isItemEligible(col.tier, item.tier)) {
          const dist = distanceXZ(clamped.x, clamped.z, item.x, item.z);
          const minAllowedDist = col.radius * 0.65 + item.radius * 0.65;

          if (dist < minAllowedDist) {
            blocked = true;
            const pushAngle = Math.atan2(clamped.z - item.z, clamped.x - item.x);
            clamped.x = item.x + Math.cos(pushAngle) * minAllowedDist;
            clamped.z = item.z + Math.sin(pushAngle) * minAllowedDist;

            const now = performance.now();
            if (now - lastBlockSoundTimeRef.current > 350) {
              gameAudio.playShieldBlock();
              lastBlockSoundTimeRef.current = now;
            }
          }
        }
      }

      col.x = clamped.x;
      col.z = clamped.z;
    }

    if (collectorGroupRef.current) {
      collectorGroupRef.current.position.set(col.x, 0, col.z);
    }

    // 3. Item Sinking Physics
    const sinkSuctionSpeed = (getConfig('sinkSpeed') as number) || 4.5;
    const growthMult = (getConfig('growthMultiplier') as number) || 1.0;
    const items = itemsRef.current;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.collected) continue;

      const itemMesh = itemMeshesRef.current[item.uid];

      if (item.sinkProgress === 0) {
        if (isItemEligible(col.tier, item.tier)) {
          const dist = distanceXZ(col.x, col.z, item.x, item.z);
          if (dist < col.radius * 0.9) {
            item.sinkProgress = 0.01;
            item.sinkTargetX = col.x;
            item.sinkTargetZ = col.z;
            gameAudio.playPotionGulp();
          }
        }
      } else {
        item.sinkProgress += dt * sinkSuctionSpeed;
        const p = Math.min(1.0, item.sinkProgress);

        const currentItemX = THREE.MathUtils.lerp(item.x, col.x, p * 0.85);
        const currentItemZ = THREE.MathUtils.lerp(item.z, col.z, p * 0.85);
        const currentItemY = -p * 1.6;
        const currentScale = item.initialScale * Math.max(0, 1 - p * 0.95);

        if (itemMesh) {
          itemMesh.position.set(currentItemX, currentItemY, currentItemZ);
          itemMesh.scale.set(currentScale, currentScale, currentScale);
          itemMesh.rotation.y += dt * 8.0;
          itemMesh.rotation.x = p * 0.8;
        }

        if (item.sinkProgress >= 1.0) {
          item.collected = true;
          if (itemMesh) {
            itemMesh.visible = false;
          }

          const earnedPoints = item.points;
          const earnedMass = item.growthValue * growthMult;
          col.mass += earnedMass;

          setGameState((prev) => ({
            ...prev,
            score: prev.score + earnedPoints,
          }));

          gameAudio.playCoinPickup();

          if (onItemCollected) {
            const def = LOGICAL_ITEMS[item.defId];
            onItemCollected(earnedPoints, def?.symbol || '✨');
          }

          const newTierSpec = getTierForMass(col.mass);
          if (newTierSpec.tier > col.tier) {
            col.tier = newTierSpec.tier;
            col.radius = newTierSpec.collectorRadius;
            col.speed = newTierSpec.speed;
            setCollectorTier(newTierSpec.tier);
            setCollectorRadius(newTierSpec.collectorRadius);

            gameAudio.playPowerupChime();
            setIsTierUpAnimating(true);
            setTimeout(() => setIsTierUpAnimating(false), 800);

            if (onTierChange) {
              onTierChange(newTierSpec.tier, newTierSpec.title);
            }
          }
        }
      }
    }

    // 4. Perspective Camera Tracking
    const tierSpec = GROWTH_TIERS[col.tier - 1];
    const cameraFollowLerp =
      (getConfig('cameraFollowSpeed') as number) || 6.0;

    _camTarget.set(col.x, 0, col.z);
    _camDesired.set(
      col.x + (getConfig('cameraX') as number),
      tierSpec.cameraHeight,
      col.z + tierSpec.cameraDistance,
    );

    camera.position.lerp(_camDesired, Math.min(1.0, cameraFollowLerp * dt));
    camera.lookAt(_camTarget);
  });

  // Presentation adapter. The simulation callback above is preserved verbatim.
  useFrame((_, delta) => {
    painterRef.current?.paint({
      collector:collectorRef.current,items:itemsRef.current,meshes:itemMeshesRef.current,
      width:levelSpec.arenaWidth,depth:levelSpec.arenaDepth,
      active:gameState.status==='PLAYING',growing:isTierUpAnimating,
    },delta);
  },1);
  return <canvas ref={canvasRef} className="counter-canvas" role="img"
    aria-label="Olympia deli countertop with a moving sandwich and collectible ingredients." />;
}

/** Original input adapter and original simulation, with a 2D artwork presentation. */
export function Game(props: GameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useInput(containerRef,{enabled:props.gameState.status==='PLAYING'});
  return <div ref={containerRef} className="canvas-wrapper"><FrameProvider><Scene {...props} inputRef={inputRef}/></FrameProvider></div>;
}
