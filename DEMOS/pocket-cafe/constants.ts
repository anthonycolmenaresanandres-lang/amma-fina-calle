
/** Game configuration schema for Pocket Collector. */
export const CONFIG = {
  // --- Game ---
  title: {
    value: 'Pocket Collector',
    type: 'string',
    label: 'Game Title',
    group: 'Game',
  },
  baseCanvasWidth: {
    value: 1280,
    type: 'number',
    label: 'Base Canvas Width',
    group: 'Game',
  },
  baseCanvasHeight: {
    value: 720,
    type: 'number',
    label: 'Base Canvas Height',
    group: 'Game',
  },

  // --- Rules ---
  roundDuration: {
    value: 60,
    type: 'number',
    label: 'Round Time Limit (s)',
    group: 'Rules',
    min: 30,
    max: 120,
    step: 5,
  },
  collectorBaseSpeed: {
    value: 9.0,
    type: 'number',
    label: 'Collector Speed',
    group: 'Rules',
    min: 4,
    max: 16,
    step: 0.5,
  },
  growthMultiplier: {
    value: 1.0,
    type: 'number',
    label: 'Growth Rate Multiplier',
    group: 'Rules',
    min: 0.5,
    max: 2.0,
    step: 0.1,
  },
  sinkSpeed: {
    value: 4.5,
    type: 'number',
    label: 'Sink Suction Speed',
    group: 'Rules',
    min: 2,
    max: 8,
    step: 0.5,
  },
  cameraFollowSpeed: {
    value: 6.0,
    type: 'number',
    label: 'Camera Follow Lerp',
    group: 'Rules',
    min: 2,
    max: 12,
    step: 0.5,
  },

  // --- Camera ---
  fov: {
    value: 50,
    type: 'number',
    label: 'Field of View',
    group: 'Camera',
    min: 35,
    max: 80,
    step: 5,
  },
  cameraX: {
    value: 0,
    type: 'number',
    label: 'Camera X Offset',
    group: 'Camera',
  },
  cameraY: {
    value: 14,
    type: 'number',
    label: 'Camera Y Elevation',
    group: 'Camera',
    min: 8,
    max: 24,
    step: 1,
  },
  cameraZ: {
    value: 12,
    type: 'number',
    label: 'Camera Z Distance',
    group: 'Camera',
    min: 6,
    max: 20,
    step: 1,
  },

  // --- Visuals & Theme ---
  backgroundColor: {
    value: '#111827',
    type: 'color',
    label: 'Background Sky Color',
    group: 'Visuals',
  },
  primaryColor: {
    value: '#38bdf8',
    type: 'color',
    label: 'Primary Accent Color',
    group: 'Visuals',
  },
  fontFamily: {
    value: 'system-ui, -apple-system, sans-serif',
    type: 'string',
    label: 'Font Family',
    group: 'Visuals',
  },
  ambientColor: {
    value: '#94a3b8',
    type: 'color',
    label: 'Ambient Light Color',
    group: 'Visuals',
  },
  ambientIntensity: {
    value: 1.6,
    type: 'number',
    label: 'Ambient Intensity',
    group: 'Visuals',
    min: 0.5,
    max: 4.0,
    step: 0.1,
  },
  sunColor: {
    value: '#fffbeb',
    type: 'color',
    label: 'Sun Light Color',
    group: 'Visuals',
  },
  sunIntensity: {
    value: 3.8,
    type: 'number',
    label: 'Sun Intensity',
    group: 'Visuals',
    min: 1.0,
    max: 8.0,
    step: 0.2,
  },
  hemiSkyColor: {
    value: '#bae6fd',
    type: 'color',
    label: 'Hemisphere Sky Color',
    group: 'Visuals',
  },
  hemiGroundColor: {
    value: '#475569',
    type: 'color',
    label: 'Hemisphere Ground Color',
    group: 'Visuals',
  },
  hemiIntensity: {
    value: 0.6,
    type: 'number',
    label: 'Hemisphere Intensity',
    group: 'Visuals',
    min: 0.1,
    max: 2.0,
    step: 0.1,
  },

  // --- Physics & Arena ---
  gravity: {
    value: -9.81,
    type: 'number',
    label: 'Gravity',
    group: 'Physics',
    min: -30,
    max: 0,
    step: 0.5,
  },

  // --- System ---
  targetFPS: {
    value: 60,
    type: 'number',
    label: 'Target FPS',
    group: 'System',
  },
  stepMs: {
    value: 1000 / 60,
    type: 'number',
    label: 'Step MS',
    group: 'System',
  },
  maxSubSteps: {
    value: 5,
    type: 'number',
    label: 'Max Sub Steps',
    group: 'System',
  },

  // --- Audio ---
  defaultMusicVolume: {
    value: 0.2,
    type: 'number',
    label: 'Default Music Volume',
    group: 'Audio',
    min: 0,
    max: 1,
    step: 0.05,
  },
  defaultSfxVolume: {
    value: 0.6,
    type: 'number',
    label: 'Default SFX Volume',
    group: 'Audio',
    min: 0,
    max: 1,
    step: 0.05,
  },
  backgroundMusicUrl: {
    value: '',
    type: 'string',
    label: 'Background Music URL',
    group: 'Audio',
  },
};

// Merge customized config values if present (injected by Playground)
const {playgroundConfig} = globalThis as {
  playgroundConfig?: Record<string, unknown>;
};
if (playgroundConfig) {
  for (const [key, value] of Object.entries(playgroundConfig)) {
    if (key in CONFIG) {
      Object.assign(CONFIG[key as keyof typeof CONFIG], {value});
    }
  }
}

/** Type helper for reading values in game code. */
export type ConfigKey = keyof typeof CONFIG;

/**
 * Gets a configuration value by key.
 * @param key The configuration key.
 * @return The configuration value.
 */
export function getConfig<K extends ConfigKey>(
  key: K,
): (typeof CONFIG)[K]['value'] {
  return CONFIG[key].value;
}

