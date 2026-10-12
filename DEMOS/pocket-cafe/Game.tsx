// tslint:disable
/* eslint-disable */
import {Canvas, useFrame, useThree, useLoader} from '@react-three/fiber';
import {Bloom, EffectComposer} from '@react-three/postprocessing';
import React, {
  MutableRefObject,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import {CafeModels, CafeModelBoundary, supportsCafeModel} from './CafeModels';
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

// Existing 2D artwork is printed on true-3D ceramic trays; it is not a 3D food model.
function CafeArt({path,size}:{path:string;size:number}){
  const texture=useLoader(THREE.TextureLoader,path);
  texture.colorSpace=THREE.SRGBColorSpace;
  return <mesh position={[0,.17,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[size,size]}/><meshStandardMaterial map={texture} transparent alphaTest={.1} roughness={.75} depthWrite={false}/></mesh>;
}
function CafePlate({path,large,color,accent}:{path:string;large:boolean;color:string;accent:string}){
  const radius=large?1.85:1.05;
  return <group><mesh position={[0,.08,0]} castShadow receiveShadow><cylinderGeometry args={[radius,radius*.94,.13,24]}/><meshStandardMaterial color={color} roughness={.4}/></mesh><mesh position={[0,.15,0]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[radius*.91,.04,6,24]}/><meshStandardMaterial color={accent}/></mesh><CafeArt path={path} size={radius*1.65}/></group>;
}
function CafeSign(){
  const texture=useLoader(THREE.TextureLoader,'./assets/colattao/logo.png');texture.colorSpace=THREE.SRGBColorSpace;
  return <group position={[0,.02,-3.6]} rotation={[-Math.PI/2,0,0]}><mesh><planeGeometry args={[5.6,2]}/><meshBasicMaterial color="#3b2819"/></mesh><mesh position={[0,0,.005]}><planeGeometry args={[5.1,1.72]}/><meshBasicMaterial map={texture} transparent alphaTest={.1}/></mesh></group>;
}

// Procedural 3D Mesh Components for Park and Tabletop themes
const ProceduralItemMesh = React.memo(function ProceduralItemMesh({
  meshType,
  color,
  accentColor,
  isLocked,
}: {
  meshType: string;
  color: string;
  accentColor: string;
  isLocked: boolean;
}) {
  const opacity = isLocked ? 0.9 : 1.0;

  switch (meshType) {
    case 'cafe_drink':
      return <group><mesh position={[0,.4,0]} castShadow><cylinderGeometry args={[.32,.25,.8,16]}/><meshStandardMaterial color={color} roughness={.35}/></mesh><mesh position={[0,.7,0]}><cylinderGeometry args={[.32,.32,.16,16]}/><meshStandardMaterial color={accentColor}/></mesh><mesh position={[.13,1,0]}><cylinderGeometry args={[.025,.025,.5,6]}/><meshStandardMaterial color="#f5e9d0"/></mesh></group>;
    // --- PARK PROPS ---
    case 'leaf':
      return (
        <group rotation={[Math.PI / 6, 0, Math.PI / 8]}>
          <mesh castShadow receiveShadow>
            <coneGeometry args={[0.3, 0.6, 5]} />
            <meshStandardMaterial
              color={color}
              roughness={0.6}
              transparent={isLocked}
              opacity={opacity}
            />
          </mesh>
          <mesh position={[0, -0.35, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.3]} />
            <meshStandardMaterial color={accentColor} />
          </mesh>
        </group>
      );

    case 'acorn':
      return (
        <group>
          <mesh position={[0, 0.15, 0]} castShadow>
            <sphereGeometry args={[0.22, 12, 12]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.15, 0.12, 12]} />
            <meshStandardMaterial color={accentColor} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.15]} />
            <meshStandardMaterial color={accentColor} />
          </mesh>
        </group>
      );

    case 'soda_can':
      return (
        <group position={[0, 0.35, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.28, 0.28, 0.7, 16]} />
            <meshStandardMaterial
              color={color}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, 0.36, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.04, 16]} />
            <meshStandardMaterial
              color={accentColor}
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
        </group>
      );

    case 'paper_cup':
      return (
        <group position={[0, 0.4, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.32, 0.22, 0.8, 16]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.26, 0.3, 16]} />
            <meshStandardMaterial color={accentColor} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.42, 0]}>
            <cylinderGeometry args={[0.34, 0.34, 0.06, 16]} />
            <meshStandardMaterial color="#334155" roughness={0.4} />
          </mesh>
        </group>
      );

    case 'park_bench':
      return (
        <group position={[0, 0.3, 0]}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[1.6, 0.08, 0.6]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.7, -0.26]} castShadow>
            <boxGeometry args={[1.6, 0.5, 0.08]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
          <mesh position={[-0.65, 0.15, 0]} castShadow>
            <boxGeometry args={[0.1, 0.3, 0.55]} />
            <meshStandardMaterial
              color={accentColor}
              metalness={0.8}
              roughness={0.4}
            />
          </mesh>
          <mesh position={[0.65, 0.15, 0]} castShadow>
            <boxGeometry args={[0.1, 0.3, 0.55]} />
            <meshStandardMaterial
              color={accentColor}
              metalness={0.8}
              roughness={0.4}
            />
          </mesh>
        </group>
      );

    case 'trash_bin':
      return (
        <group position={[0, 0.55, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.42, 0.38, 1.1, 16]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.6, 0]} castShadow>
            <sphereGeometry args={[0.43, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={accentColor} roughness={0.4} />
          </mesh>
        </group>
      );

    case 'picnic_table':
      return (
        <group position={[0, 0.45, 0]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[2.0, 0.1, 1.2]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.15, 0.9]} castShadow>
            <boxGeometry args={[2.0, 0.08, 0.35]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.15, -0.9]} castShadow>
            <boxGeometry args={[2.0, 0.08, 0.35]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
          <mesh position={[-0.7, 0.1, 0]} castShadow>
            <boxGeometry args={[0.1, 0.4, 1.9]} />
            <meshStandardMaterial color={accentColor} roughness={0.8} />
          </mesh>
          <mesh position={[0.7, 0.1, 0]} castShadow>
            <boxGeometry args={[0.1, 0.4, 1.9]} />
            <meshStandardMaterial color={accentColor} roughness={0.8} />
          </mesh>
        </group>
      );

    case 'street_lamp':
      return (
        <group position={[0, 1.2, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.08, 0.14, 2.4, 8]} />
            <meshStandardMaterial
              color={color}
              metalness={0.7}
              roughness={0.4}
            />
          </mesh>
          <mesh position={[0, 1.2, 0]} castShadow>
            <octahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={1.5}
            />
          </mesh>
          <pointLight
            position={[0, 1.2, 0]}
            color={accentColor}
            intensity={12}
            distance={4.5}
          />
        </group>
      );

    case 'gazebo':
      return (
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[2.4, 2.6, 0.3, 8]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const angle = (i * Math.PI * 2) / 6;
            const px = Math.cos(angle) * 1.9;
            const pz = Math.sin(angle) * 1.9;
            return (
              <mesh key={i} position={[px, 1.4, pz]} castShadow>
                <cylinderGeometry args={[0.08, 0.08, 2.2, 8]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.6} />
              </mesh>
            );
          })}
          <mesh position={[0, 2.9, 0]} castShadow>
            <coneGeometry args={[2.7, 1.4, 8]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
        </group>
      );

    case 'fountain_statue':
      return (
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[2.6, 2.4, 0.6, 16]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.55, 0]}>
            <cylinderGeometry args={[2.4, 2.4, 0.1, 16]} />
            <meshStandardMaterial
              color="#38bdf8"
              metalness={0.2}
              roughness={0.1}
            />
          </mesh>
          <mesh position={[0, 1.2, 0]} castShadow>
            <cylinderGeometry args={[1.1, 1.3, 1.2, 12]} />
            <meshStandardMaterial color="#64748b" roughness={0.6} />
          </mesh>
          <mesh position={[0, 2.2, 0]} castShadow>
            <octahedronGeometry args={[0.7, 0]} />
            <meshStandardMaterial
              color={accentColor}
              metalness={0.9}
              roughness={0.2}
              emissive={accentColor}
              emissiveIntensity={0.4}
            />
          </mesh>
        </group>
      );

    // --- RESTAURANT TABLETOP PROPS ---
    case 'sugar_cube':
      return (
        <group position={[0, 0.2, 0]} rotation={[0, Math.PI / 4, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.35, 0.35, 0.35]} />
            <meshStandardMaterial
              color={color}
              roughness={0.2}
              metalness={0.1}
            />
          </mesh>
        </group>
      );

    case 'mint_leaf':
      return (
        <group position={[0, 0.1, 0]}>
          <mesh rotation={[0.3, 0.4, 0]} castShadow>
            <coneGeometry args={[0.22, 0.45, 4]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
          <mesh rotation={[-0.3, -0.4, 0]} castShadow>
            <coneGeometry args={[0.18, 0.38, 4]} />
            <meshStandardMaterial color={accentColor} roughness={0.5} />
          </mesh>
        </group>
      );

    case 'squeeze_bottle':
      return (
        <group position={[0, 0.45, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.24, 0.24, 0.7, 16]} />
            <meshStandardMaterial color={color} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.45, 0]} castShadow>
            <coneGeometry args={[0.12, 0.25, 16]} />
            <meshStandardMaterial color={accentColor} roughness={0.3} />
          </mesh>
        </group>
      );

    case 'espresso_cup':
      return (
        <group position={[0, 0.2, 0]}>
          <mesh position={[0, 0.03, 0]} castShadow>
            <cylinderGeometry args={[0.42, 0.35, 0.06, 16]} />
            <meshStandardMaterial color={color} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.26, 0.18, 0.38, 16]} />
            <meshStandardMaterial color={color} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.38, 0]}>
            <cylinderGeometry args={[0.23, 0.23, 0.04, 16]} />
            <meshStandardMaterial color={accentColor} roughness={0.1} />
          </mesh>
        </group>
      );

    case 'burger_plate':
      return (
        <group position={[0, 0.2, 0]}>
          <mesh position={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.9, 0.8, 0.08, 20]} />
            <meshStandardMaterial color={accentColor} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.14, 0]} castShadow>
            <cylinderGeometry args={[0.5, 0.5, 0.12, 16]} />
            <meshStandardMaterial color="#ca8a04" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.24, 0]} castShadow>
            <cylinderGeometry args={[0.52, 0.52, 0.1, 16]} />
            <meshStandardMaterial color="#451a03" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.31, 0]} rotation={[0, Math.PI / 6, 0]}>
            <boxGeometry args={[0.65, 0.04, 0.65]} />
            <meshStandardMaterial color="#eab308" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.42, 0]} castShadow>
            <sphereGeometry args={[0.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#ca8a04" roughness={0.6} />
          </mesh>
        </group>
      );

    case 'teapot':
      return (
        <group position={[0, 0.45, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.55, 16, 16]} />
            <meshStandardMaterial
              color={color}
              metalness={0.2}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, 0.55, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
            <meshStandardMaterial color={accentColor} roughness={0.2} />
          </mesh>
          <mesh
            position={[0.55, 0.2, 0]}
            rotation={[0, 0, -Math.PI / 4]}
            castShadow>
            <cylinderGeometry args={[0.08, 0.14, 0.5, 12]} />
            <meshStandardMaterial color={color} roughness={0.2} />
          </mesh>
        </group>
      );

    case 'pizza_platter':
      return (
        <group position={[0, 0.15, 0]}>
          <mesh position={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[1.5, 1.5, 0.1, 20]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.13, 0]} castShadow>
            <cylinderGeometry args={[1.3, 1.3, 0.06, 20]} />
            <meshStandardMaterial color="#fef08a" roughness={0.4} />
          </mesh>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const angle = (i * Math.PI * 2) / 6;
            const rx = Math.cos(angle) * 0.75;
            const rz = Math.sin(angle) * 0.75;
            return (
              <mesh key={i} position={[rx, 0.18, rz]}>
                <cylinderGeometry args={[0.18, 0.18, 0.03, 10]} />
                <meshStandardMaterial color={accentColor} roughness={0.5} />
              </mesh>
            );
          })}
        </group>
      );

    case 'sundae_glass':
      return (
        <group position={[0, 0.6, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.4, 0.6, 12]} />
            <meshStandardMaterial
              color="#e0f2fe"
              transparent
              opacity={0.7}
              roughness={0.1}
            />
          </mesh>
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.6, 0.25, 0.7, 16]} />
            <meshStandardMaterial
              color="#e0f2fe"
              transparent
              opacity={0.7}
              roughness={0.1}
            />
          </mesh>
          <mesh position={[0, 0.45, 0]} castShadow>
            <sphereGeometry args={[0.45, 12, 12]} />
            <meshStandardMaterial color={color} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.9, 0]} castShadow>
            <sphereGeometry args={[0.14, 10, 10]} />
            <meshStandardMaterial
              color="#dc2626"
              metalness={0.4}
              roughness={0.2}
            />
          </mesh>
        </group>
      );

    case 'lazy_susan':
      return (
        <group position={[0, 0.3, 0]}>
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[2.5, 2.5, 0.2, 24]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
          {[0, 1, 2, 3, 4].map((i) => {
            const angle = (i * Math.PI * 2) / 5;
            const bx = Math.cos(angle) * 1.6;
            const bz = Math.sin(angle) * 1.6;
            return (
              <mesh key={i} position={[bx, 0.3, bz]} castShadow>
                <cylinderGeometry args={[0.4, 0.25, 0.25, 12]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.2} />
              </mesh>
            );
          })}
        </group>
      );

    case 'grand_cake':
      return (
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[2.7, 2.5, 0.4, 24]} />
            <meshStandardMaterial
              color="#cbd5e1"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, 0.8, 0]} castShadow>
            <cylinderGeometry args={[2.2, 2.2, 0.8, 20]} />
            <meshStandardMaterial color={color} roughness={0.3} />
          </mesh>
          <mesh position={[0, 1.7, 0]} castShadow>
            <cylinderGeometry args={[1.5, 1.5, 0.8, 20]} />
            <meshStandardMaterial color={accentColor} roughness={0.3} />
          </mesh>
          <mesh position={[0, 2.5, 0]} castShadow>
            <cylinderGeometry args={[0.9, 0.9, 0.7, 16]} />
            <meshStandardMaterial color={color} roughness={0.3} />
          </mesh>
          <mesh position={[0, 3.0, 0]} castShadow>
            <octahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial
              color="#fbbf24"
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        </group>
      );

    default:
      return (
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      );
  }
});

// Arena Floor & Perimeter Wall Mesh with procedural texture generator
function ArenaEnvironment({
  width,
  depth,
  skin,
}: {
  width: number;
  depth: number;
  skin: SkinConfig;
}) {
  const halfW = width / 2;
  const halfD = depth / 2;

  const floorTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if (skin.groundPattern === 'checkered') {
      const size = 32;
      for (let x = 0; x < 256; x += size) {
        for (let y = 0; y < 256; y += size) {
          const isEven = (x / size + y / size) % 2 === 0;
          ctx.fillStyle = isEven
            ? skin.groundColor
            : skin.groundSecondaryColor;
          ctx.fillRect(x, y, size, size);
        }
      }
    } else {
      ctx.fillStyle = skin.groundColor;
      ctx.fillRect(0, 0, 256, 256);
      ctx.fillStyle = skin.groundSecondaryColor;
      for (let i = 0; i < 350; i++) {
        const px = Math.random() * 256;
        const py = Math.random() * 256;
        const s = 2 + Math.random() * 3;
        ctx.fillRect(px, py, s, s);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(width / 4, depth / 4);
    return tex;
  }, [skin, width, depth]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial
          map={floorTexture || undefined}
          color={!floorTexture ? skin.groundColor : '#ffffff'}
          roughness={0.8}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[width * 3, depth * 3]} />
        <meshStandardMaterial color={skin.skyColor} roughness={0.9} />
      </mesh>

      <mesh position={[0, 0.4, -halfD]} castShadow receiveShadow>
        <boxGeometry args={[width + 1.6, 0.8, 0.8]} />
        <meshStandardMaterial color={skin.wallColor} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.4, halfD]} castShadow receiveShadow>
        <boxGeometry args={[width + 1.6, 0.8, 0.8]} />
        <meshStandardMaterial color={skin.wallColor} roughness={0.7} />
      </mesh>
      <mesh position={[halfW, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.8, depth + 1.6]} />
        <meshStandardMaterial color={skin.wallColor} roughness={0.7} />
      </mesh>
      <mesh position={[-halfW, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.8, depth + 1.6]} />
        <meshStandardMaterial color={skin.wallColor} roughness={0.7} />
      </mesh>

      <mesh position={[0, 0.85, -halfD]}>
        <boxGeometry args={[width + 1.8, 0.1, 0.9]} />
        <meshStandardMaterial color={skin.wallTrimColor} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.85, halfD]}>
        <boxGeometry args={[width + 1.8, 0.1, 0.9]} />
        <meshStandardMaterial color={skin.wallTrimColor} roughness={0.4} />
      </mesh>
      <mesh position={[halfW, 0.85, 0]}>
        <boxGeometry args={[0.9, 0.1, depth + 1.8]} />
        <meshStandardMaterial color={skin.wallTrimColor} roughness={0.4} />
      </mesh>
      <mesh position={[-halfW, 0.85, 0]}>
        <boxGeometry args={[0.9, 0.1, depth + 1.8]} />
        <meshStandardMaterial color={skin.wallTrimColor} roughness={0.4} />
      </mesh>
    </group>
  );
}

// Collector Hole Mesh & Animated Vortex Rim
function CollectorVisual({
  radius,
  skin,
  isGrowing,
}: {
  radius: number;
  skin: SkinConfig;
  isGrowing: boolean;
}) {
  const rimRef = useRef<THREE.Mesh>(null);
  const vortexRef = useRef<THREE.Mesh>(null);

  useFrame(({clock}) => {
    const t = clock.getElapsedTime();
    if (vortexRef.current) {
      vortexRef.current.rotation.z = -t * 3.5;
    }
    if (rimRef.current) {
      const pulse = 1 + Math.sin(t * 8) * 0.04;
      rimRef.current.scale.set(radius * pulse, radius * pulse, 1);
    }
  });

  return (
    <group position={[0, 0.02, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <circleGeometry args={[radius * 0.94, 32]} />
        <meshBasicMaterial color="#020617" />
      </mesh>

      <mesh
        ref={vortexRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}>
        <ringGeometry args={[radius * 0.2, radius * 0.92, 32]} />
        <meshBasicMaterial
          color={skin.collectorVortexColor}
          transparent
          opacity={0.8}
        />
      </mesh>

      <mesh
        ref={rimRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.015, 0]}>
        <ringGeometry args={[0.94, 1.08, 36]} />
        <meshBasicMaterial
          color={isGrowing ? '#fef08a' : skin.collectorRimColor}
        />
      </mesh>

      <pointLight
        position={[0, 0.8, 0]}
        color={skin.collectorRimColor}
        intensity={20}
        distance={radius * 4.2}
      />
    </group>
  );
}

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
  const {camera} = useThree();
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

  const collectorGroupRef = useRef<THREE.Group>(null);
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

  return (
    <group>
      <ArenaEnvironment
        width={levelSpec.arenaWidth}
        depth={levelSpec.arenaDepth}
        skin={skin}
      />
      {skin.id==='colattao'&&<CafeSign/>}

      <group ref={collectorGroupRef}>
        <CollectorVisual
          radius={collectorRadius}
          skin={skin}
          isGrowing={isTierUpAnimating}
        />
      </group>

      {itemsRef.current.map((item) => {
        const visual = skin.items[item.defId] || {
          displayName: 'Prop',
          color: '#38bdf8',
          accentColor: '#0284c7',
          meshType: 'box',
          scale: [1, 1, 1],
        };
        const isLocked = !isItemEligible(collectorTier, item.tier);

        return (
          <group
            key={item.uid}
            ref={(el) => {
              itemMeshesRef.current[item.uid] = el;
            }}
            position={[item.x, 0, item.z]}
            scale={[item.initialScale, item.initialScale, item.initialScale]}
            rotation={[0, item.rotationY, 0]}>
            {skin.id==='colattao' && supportsCafeModel(item.defId) ? <CafeModelBoundary radius={LOGICAL_ITEMS[item.defId].radius} height={LOGICAL_ITEMS[item.defId].height}><CafeModels defId={item.defId} radius={LOGICAL_ITEMS[item.defId].radius} height={LOGICAL_ITEMS[item.defId].height} isLocked={isLocked}/></CafeModelBoundary> : visual.texturePath ? <CafePlate path={visual.texturePath} large={visual.meshType==='cafe_tray'} color={visual.color} accent={visual.accentColor}/> : <ProceduralItemMesh
              meshType={visual.meshType}
              color={visual.color}
              accentColor={visual.accentColor}
              isLocked={isLocked}
            />}
          </group>
        );
      })}
    </group>
  );
}

/** Camera setup component */
function CameraSetup(): null {
  const {camera} = useThree();

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = (getConfig('fov') as number) || 50;
      camera.updateProjectionMatrix();
    }
  }, [camera]);

  return null;
}

/** Main Exported Game Canvas Component */
export function Game(props: GameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useInput(containerRef, {enabled: true});
  const skin = getSkinConfig(props.selectedSkinId);

  return (
    <div
      ref={containerRef}
      className="w-full h-full canvas-wrapper relative touch-none select-none">
      <Canvas
        fallback={<div className="render-error">WebGL is unavailable. Enable hardware acceleration to play.</div>}
        shadows
        dpr={[1, typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 1.75) : 1]}
        camera={{
          fov: (getConfig('fov') as number) || 50,
          near: 0.1,
          far: 200,
          position: [0, 14, 12],
        }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        scene={{
          background: new THREE.Color(skin.skyColor),
          fog: new THREE.FogExp2(skin.skyColor, 0.015),
        }}>
        <Suspense fallback={null}>
          <CameraSetup />

          <ambientLight
            color={skin.ambientColor}
            intensity={(getConfig('ambientIntensity') as number) || 1.6}
          />
          <directionalLight
            position={[12, 24, 16]}
            intensity={(getConfig('sunIntensity') as number) || 3.8}
            color={skin.sunColor}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-near={0.5}
            shadow-camera-far={80}
            shadow-camera-left={-25}
            shadow-camera-right={25}
            shadow-camera-top={25}
            shadow-camera-bottom={-25}
            shadow-bias={-0.0005}
          />
          <hemisphereLight
            color={skin.ambientColor}
            groundColor={skin.groundColor}
            intensity={(getConfig('hemiIntensity') as number) || 0.6}
          />

          <Scene {...props} inputRef={inputRef} />

          <EffectComposer>
            <Bloom
              luminanceThreshold={0.95}
              luminanceSmoothing={0.8}
              intensity={0.35}
              mipmapBlur
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
