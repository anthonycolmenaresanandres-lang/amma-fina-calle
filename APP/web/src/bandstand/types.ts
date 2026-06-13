// Bandstand — a "build-a-band" generative music toy (My Singing Monsters-style).
// Each mascot IS one instrument part; tapping it layers/removes its loop in time.
// The ENGINE owns the music (tempo, scale, per-role patterns) so any combination
// of mascots always sounds consonant. A SKIN is purely cosmetic: it names the
// mascots, colors them, and assigns each one a musical role. That keeps client
// skinning a config swap (no engine/music change) — same model as Conquest.

export type VoiceRole = "kick" | "hat" | "bass" | "pad" | "lead" | "arp";

export type MascotConfig = {
  id: string;
  name: string; // short label shown under the pod
  role: VoiceRole; // which musical part this mascot sings
  color: string; // body color (CSS) — also the procedural fallback when no image
  accent: string; // accent / glow color (CSS)
  image?: string; // optional sprite (public path); draws instead of the blob
};

export type BandstandSkin = {
  id: string;
  brandName: string; // small uppercase eyebrow
  skinName: string; // big title
  tagline: string;
  bpm: number;
  colors: {
    bg: string;
    stage: string;
    text: string;
    dim: string;
  };
  mascots: MascotConfig[]; // 5-6 recommended
};
