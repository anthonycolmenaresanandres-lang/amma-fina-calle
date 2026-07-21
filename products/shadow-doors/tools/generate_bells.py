#!/usr/bin/env python3
# Shadow Doors — funeral bells (Anthony's direction, 2026-07-20):
# "let's just do bells and the demonic voice only, like Undertaker-style bells."
# The chant bed retires; the ambient becomes slow, deep funeral-bell tolls with long
# decays, and the whisper beat becomes a single DISTANT muffled toll at the door.
#
#   * bells_loop.wav — 24 s seamless ambient: deep G2 tolls at t=0/8/16 with 16 s
#                      decay tails that WRAP around the loop point (a toll's tail is
#                      still ringing when the loop restarts — no seam, no silence).
#   * bell_far.wav   — one distant toll (D2, heavily lowpassed): the "watched" cue
#                      played spatially at a door on whisper events.
#
# Pure stdlib, deterministic (fixed seed/args), same conventions as
# tools/generate_audio.py / generate_voices.py: -3 dBFS normalize, 44.1 kHz 16-bit mono.
#
# Bell synthesis: additive inharmonic partials (hum/prime/tierce/quint/nominal — the
# classic bell ratios), each a slightly detuned pair (slow beating = big-bell shimmer),
# exponential decays, plus a short filtered strike transient.
#
# Run:  python3 tools/generate_bells.py   ->  Assets/ShadowDoors/Audio/*.wav
# Token: SHADOWDOORS_BELLS_GENERATED

import math
import os
import random
import struct
import wave

random.seed(47)

SAMPLE_RATE = 44100
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.normpath(os.path.join(SCRIPT_DIR, "..", "Assets", "ShadowDoors", "Audio"))


def log(msg):
    print("[OK] " + msg)


def write_wav(name, samples):
    peak = max(1e-9, max(abs(s) for s in samples))
    target = 10 ** (-3.0 / 20.0)  # -3 dBFS
    gain = target / peak
    path = os.path.join(OUT_DIR, name)
    with wave.open(path, "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SAMPLE_RATE)
        frames = bytearray()
        for s in samples:
            v = int(max(-1.0, min(1.0, s * gain)) * 32767)
            frames += struct.pack("<h", v)
        w.writeframes(bytes(frames))
    log("%s  %.2fs  %d bytes" % (name, len(samples) / SAMPLE_RATE, os.path.getsize(path)))


def one_pole_lowpass(samples, cutoff_hz):
    dt = 1.0 / SAMPLE_RATE
    rc = 1.0 / (2 * math.pi * cutoff_hz)
    alpha = dt / (rc + dt)
    out = []
    y = 0.0
    for s in samples:
        y += alpha * (s - y)
        out.append(y)
    return out


# Classic bell partials as (ratio to fundamental, amplitude, decay seconds).
# Hum rings longest; the upper partials die fast — that's what reads as "bell".
BELL_PARTIALS = [
    (0.5, 1.00, 9.0),   # hum
    (1.0, 0.80, 6.5),   # prime
    (1.2, 0.45, 4.2),   # tierce (minor third — the mournful one)
    (1.5, 0.32, 3.4),   # quint
    (2.0, 0.50, 2.8),   # nominal
    (2.67, 0.18, 1.7),
    (3.01, 0.10, 1.1),
]


def bell_toll(f0, seconds):
    """One toll: detuned partial pairs + a brief filtered strike."""
    n = int(seconds * SAMPLE_RATE)
    out = [0.0] * n
    for ratio, amp, decay in BELL_PARTIALS:
        for detune in (0.9985, 1.0015):  # slow beating between the pair
            f = f0 * ratio * detune
            phase = random.uniform(0, 2 * math.pi)
            for i in range(n):
                t = i / SAMPLE_RATE
                env = math.exp(-t / decay)
                out[i] += 0.5 * amp * env * math.sin(2 * math.pi * f * t + phase)

    # Strike transient: 25 ms noise burst, lowpassed, fast decay — the clapper hit.
    strike = [random.uniform(-1, 1) * math.exp(-i / (0.008 * SAMPLE_RATE))
              for i in range(int(0.025 * SAMPLE_RATE))]
    strike = one_pole_lowpass(strike, 1800)
    for i, s in enumerate(strike):
        out[i] += s * 0.6
    return out


def mix_into_wrapped(base, add, offset):
    """Mix `add` into fixed-length `base` starting at `offset`, wrapping past the end
    — this is what makes the loop seamless: decay tails ring across the loop point."""
    n = len(base)
    for i, s in enumerate(add):
        base[(offset + i) % n] += s
    return base


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    # Ambient: 24 s loop, deep G2 (98 Hz) tolls every 8 s. Tails wrap.
    loop_n = int(24.0 * SAMPLE_RATE)
    loop = [0.0] * loop_n
    toll = bell_toll(98.0, 16.0)
    for toll_at in (0.0, 8.0, 16.0):
        loop = mix_into_wrapped(loop, toll, int(toll_at * SAMPLE_RATE))
    write_wav("bells_loop.wav", loop)

    # The distant toll: lower (D2), muffled hard — heard through walls.
    far = one_pole_lowpass(bell_toll(73.42, 7.0), 500)
    write_wav("bell_far.wav", far)

    print("SHADOWDOORS_BELLS_GENERATED")


if __name__ == "__main__":
    main()
