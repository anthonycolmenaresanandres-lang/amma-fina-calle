# generate_audio.py
# Shadow Doors AR MVP — procedural placeholder audio generator
# (PRODUCT_MODULES/AR_SHADOW_DOORS_MVP.md: "Procedural audio — reuse the DC pipeline's
# stdlib WAV generator style"). Adapted from EscapeTheBomb-DC's
# Scripts/Python/generate_placeholder_audio.py — same DSP primitives, same determinism
# pattern, same [OK]/[!!] + terminal-token house style.
#
# PURE STDLIB — wave / math / random / array / os / sys only. No numpy, no pip.
#
# Writes six 44.1 kHz 16-bit mono WAVs into Assets/ShadowDoors/Audio/ (created if missing),
# one per AudioKit asset named in the ScenarioDirector/BanishSystem contract:
#   whisper_loop.wav     8 s loopable — band-filtered noise, slow detuned "formant" sweeps,
#                         unsettling/non-verbal, breathing amplitude LFO, endpoint-matched loop
#   heartbeat_loop.wav    4 s loopable — sub-bass double-thump (lub-dub) at ~55 bpm
#   emerge_hiss.wav        2 s — rising filtered noise + rising low tone, swell-in
#   banish_stinger.wav     1.5 s — bright noise burst -> shimmering high-partial decay
#   dawn_chord.wav          4 s — warm major-ish pad, 3 sines (C4/E4/G4), slow attack
#   found_you.wav          2.5 s — sub-bass drop + noise slam
#
# Deterministic: random.seed(13) is set once at import time and every asset is generated in
# a fixed order (the ASSETS table order below) by a single top-to-bottom pass through main(),
# so the sequence of random.uniform() calls — and therefore every output sample — is
# identical on every run. No timestamps or other run-varying state feed into the signal.
#
# Each asset is normalized independently to a -3 dBFS peak, then clamped to int16. Prints an
# [OK]/[!!] line per file with duration + achieved peak, then a final token:
# SHADOWDOORS_AUDIO_GENERATED on success, or SHADOWDOORS_AUDIO_GENERATED_FAILED: <reason(s)>
# with a nonzero exit on any failure.

import array
import math
import os
import random
import sys
import wave

SR = 44100
TARGET_PEAK_DB = -3.0

random.seed(13)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
AUDIO_DIR = os.path.join(PROJECT_ROOT, "Assets", "ShadowDoors", "Audio")

failures = []


def log(ok, msg):
    print(("[OK] " if ok else "[!!] ") + msg)
    if not ok:
        failures.append(msg)


# ---------------------------------------------------------------------------------------------
# DSP primitives (one_pole_lowpass / white_noise / brown_noise / raised_cosine_swell /
# seamless_loop_crossfade lifted near-verbatim from generate_placeholder_audio.py; the rest
# are small additions needed for this asset set: a time-varying-cutoff low-pass for sweeps,
# a high-pass built from the low-pass, and a couple of mixing helpers).
# ---------------------------------------------------------------------------------------------

def one_pole_lowpass(x, sr, cutoff_hz):
    """Standard discretized RC one-pole low-pass: y[n] = y[n-1] + a*(x[n]-y[n-1]),
    a = 1 - exp(-2*pi*fc/sr). -3 dB at cutoff_hz, -6 dB/oct above it."""
    if cutoff_hz <= 0:
        return list(x)
    alpha = 1.0 - math.exp(-2.0 * math.pi * cutoff_hz / sr)
    y = [0.0] * len(x)
    prev = 0.0
    for i in range(len(x)):
        prev = prev + alpha * (x[i] - prev)
        y[i] = prev
    return y


def time_varying_lowpass(x, sr, cutoff_fn):
    """Same one-pole low-pass, but the cutoff (Hz) is recomputed every sample from
    cutoff_fn(i, t) — used for the whisper formant sweeps and the emerge-hiss rising
    brightness, where a single static cutoff can't express the motion."""
    n = len(x)
    y = [0.0] * n
    prev = 0.0
    for i in range(n):
        t = i / sr
        fc = max(cutoff_fn(i, t), 1.0)
        alpha = 1.0 - math.exp(-2.0 * math.pi * fc / sr)
        prev = prev + alpha * (x[i] - prev)
        y[i] = prev
    return y


def one_pole_highpass(x, sr, cutoff_hz):
    """Complement of the low-pass: high-passed = original - low-passed."""
    low = one_pole_lowpass(x, sr, cutoff_hz)
    return [x[i] - low[i] for i in range(len(x))]


def white_noise(n):
    return [random.uniform(-1.0, 1.0) for _ in range(n)]


def brown_noise(n, leak):
    """Integrated (leaky) white noise; the leak is itself a very-low-cutoff one-pole
    low-pass, keeping the random-walk integrator bounded."""
    x = 0.0
    out = [0.0] * n
    for i in range(n):
        x = (1.0 - leak) * x + random.uniform(-1.0, 1.0)
        out[i] = x
    return out


def raised_cosine_swell(t, attack):
    """0 -> 1 ease-in over [0, attack)."""
    if t >= attack:
        return 1.0
    return 0.5 - 0.5 * math.cos(math.pi * t / attack)


def seamless_loop_crossfade(buf_extended, loop_len, xfade_len):
    """Standard wavetable-style loop crossfade: buf_extended must be a single continuous
    signal of length >= loop_len + xfade_len. out[0] starts as (almost) exactly
    buf_extended[loop_len] — the sample that truly follows out[loop_len-1] in the unbroken
    source — so the wrap-around out[loop_len-1] -> out[0] is a real continuation of the
    waveform, equal-power blended against the natural head content. This is what makes the
    stochastic loops here (whisper_loop, heartbeat_loop) endpoint-matched without needing to
    solve for periodicity analytically."""
    out = list(buf_extended[:loop_len])
    for k in range(xfade_len):
        w = k / float(xfade_len)
        fade_in = math.sin(w * math.pi / 2.0)
        fade_out = math.cos(w * math.pi / 2.0)
        head_natural = buf_extended[k]
        post_loop_continuation = buf_extended[loop_len + k]
        out[k] = head_natural * fade_in + post_loop_continuation * fade_out
    return out


def add_at(dest, src, offset):
    """Overlay src into dest starting at sample index offset (clipped to dest's bounds)."""
    for i, v in enumerate(src):
        idx = offset + i
        if 0 <= idx < len(dest):
            dest[idx] += v


# ---------------------------------------------------------------------------------------------
# Asset generators — each returns (samples: list[float] roughly in [-1, 1], sr)
# ---------------------------------------------------------------------------------------------

def gen_whisper_loop():
    """8 s loopable dread bed: white noise passed through a band (two time-varying one-pole
    filters — a low-passed upper edge, then a low-passed-and-subtracted lower edge) whose
    center sweeps slowly. The two sweep rates (0.037 Hz and 0.061 Hz) are chosen to never
    share a short common period, so the band drifts unpredictably instead of settling into a
    vowel-like resonance — "unsettling, not verbal" per the spec. A slow amplitude LFO adds a
    breathing quality. Loop-safe via seamless_loop_crossfade (same technique as the DC
    generator's wind roar — the right tool for stochastic, non-periodic content)."""
    loop_dur = 8.0
    xfade_dur = 0.4
    loop_n = int(loop_dur * SR)
    xfade_n = int(xfade_dur * SR)
    total_n = loop_n + xfade_n

    raw = white_noise(total_n)

    def cutoff_hi(i, t):
        return 1800.0 + 900.0 * math.sin(2 * math.pi * 0.061 * t + 1.7)

    def cutoff_lo(i, t):
        return 500.0 + 250.0 * math.sin(2 * math.pi * 0.037 * t)

    upper = time_varying_lowpass(raw, SR, cutoff_hi)
    lower_component = time_varying_lowpass(upper, SR, cutoff_lo)
    band = [upper[i] - lower_component[i] for i in range(total_n)]

    breath = [0.55 + 0.45 * math.sin(2 * math.pi * 0.05 * (i / SR) + 0.4) for i in range(total_n)]
    samples = [band[i] * breath[i] for i in range(total_n)]

    return seamless_loop_crossfade(samples, loop_n, xfade_n), SR


def gen_heartbeat_loop():
    """4 s loopable sub-bass heartbeat at ~55 bpm (period 60/55 = 1.0909 s). Brown noise
    low-passed under 85 Hz, shaped by a lub-dub pair of exponential-decay thump envelopes per
    beat (dub slightly softer + 0.16 s after lub, mirroring real S1/S2 spacing). Generated
    continuously across the loop+crossfade region, then made seamless via
    seamless_loop_crossfade (55 bpm doesn't divide 4 s into a whole number of beats, so
    crossfade — not periodicity math — is what makes the wrap silent)."""
    loop_dur = 4.0
    xfade_dur = 0.25
    loop_n = int(loop_dur * SR)
    xfade_n = int(xfade_dur * SR)
    total_n = loop_n + xfade_n

    bpm = 55.0
    period = 60.0 / bpm
    dub_offset = 0.16
    thump_tau = 0.09

    raw = brown_noise(total_n, leak=0.001)
    sub = one_pole_lowpass(raw, SR, 85.0)

    env = [0.0] * total_n
    beat_t = 0.0
    while beat_t < (total_n / SR) + period:
        for offset, amp in ((0.0, 1.0), (dub_offset, 0.72)):
            start_i = int((beat_t + offset) * SR)
            if start_i >= total_n:
                continue
            for k in range(start_i, total_n):
                t = (k - start_i) / SR
                e = amp * math.exp(-t / thump_tau)
                if e < 1e-4:
                    break
                env[k] += e
        beat_t += period

    samples = [sub[i] * env[i] for i in range(total_n)]
    return seamless_loop_crossfade(samples, loop_n, xfade_n), SR


def gen_emerge_hiss():
    """2 s emergence cue: white noise low-passed with a cutoff rising 250 -> 4200 Hz (a
    brightening hiss, "something is unfolding") layered with a low sine tone rising
    45 -> 95 Hz, both under a 0.5 s raised-cosine swell so the sound blooms in rather than
    snapping to full level."""
    dur = 2.0
    n = int(dur * SR)

    raw = white_noise(n)

    def cutoff(i, t):
        return 250.0 + (4200.0 - 250.0) * (t / dur)

    hiss = time_varying_lowpass(raw, SR, cutoff)

    tone = [0.0] * n
    phase = 0.0
    for i in range(n):
        t = i / SR
        f = 45.0 + (95.0 - 45.0) * (t / dur)
        tone[i] = math.sin(phase)
        phase += 2 * math.pi * f / SR

    swell = [raised_cosine_swell(i / SR, 0.5) for i in range(n)]
    samples = [(0.75 * hiss[i] + 0.5 * tone[i]) * swell[i] for i in range(n)]
    return samples, SR


def gen_banish_stinger():
    """1.5 s success cue: a bright ~20 ms noise burst (white noise low-passed at 7 kHz so it
    reads as "bright" rather than harsh full-band static, 3 ms fade edges to stay click-free)
    followed by a shimmering decay — three high sine partials (1800/2700/3600 Hz) under a
    7 Hz tremolo and a 0.5 s exponential decay."""
    dur = 1.5
    n = int(dur * SR)

    burst_dur = 0.02
    burst_n = int(burst_dur * SR)
    burst = one_pole_lowpass(white_noise(burst_n), SR, 7000.0)
    fade_n = min(int(0.003 * SR), burst_n // 2)
    for k in range(fade_n):
        g = k / float(fade_n)
        burst[k] *= g
        burst[burst_n - 1 - k] *= g

    shimmer = [0.0] * n
    for freq, amp in ((1800.0, 1.0), (2700.0, 0.6), (3600.0, 0.4)):
        phase = 0.0
        for i in range(n):
            shimmer[i] += amp * math.sin(phase)
            phase += 2 * math.pi * freq / SR
    tremolo = [0.6 + 0.4 * math.sin(2 * math.pi * 7.0 * (i / SR)) for i in range(n)]
    decay = [math.exp(-(i / SR) / 0.5) for i in range(n)]
    shimmer = [shimmer[i] * tremolo[i] * decay[i] * 0.35 for i in range(n)]

    samples = [0.0] * n
    add_at(samples, burst, 0)
    for i in range(n):
        samples[i] += shimmer[i]
    return samples, SR


def gen_dawn_chord():
    """4 s relief cue: a warm major-ish pad from three sines at C4/E4/G4
    (261.63/329.63/392.00 Hz), gently low-passed at 2200 Hz to round off the harmonics, with
    a slow 1.5 s raised-cosine attack, a held middle, and a linear fade to silence over the
    final second."""
    dur = 4.0
    n = int(dur * SR)

    samples = [0.0] * n
    for freq, w in ((261.63, 0.5), (329.63, 0.35), (392.00, 0.3)):
        phase = 0.0
        for i in range(n):
            samples[i] += w * math.sin(phase)
            phase += 2 * math.pi * freq / SR

    warm = one_pole_lowpass(samples, SR, 2200.0)

    attack, release_start = 1.5, 3.0
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        if t < attack:
            e = raised_cosine_swell(t, attack)
        elif t < release_start:
            e = 1.0
        else:
            e = max(0.0, 1.0 - (t - release_start) / (dur - release_start))
        out[i] = warm[i] * e
    return out, SR


def gen_found_you():
    """2.5 s fail cue: a sharp ~40 ms broadband noise slam (low-passed at 5 kHz, 4 ms fade
    edges) coincident with a sub-bass drop — a sine sweeping 180 -> 32 Hz over 0.5 s, then
    holding at 32 Hz and decaying (tau 0.9 s) through the rest of the clip."""
    dur = 2.5
    n = int(dur * SR)

    slam_dur = 0.04
    slam_n = int(slam_dur * SR)
    slam = one_pole_lowpass(white_noise(slam_n), SR, 5000.0)
    fade_n = min(int(0.004 * SR), slam_n // 2)
    for k in range(fade_n):
        g = k / float(fade_n)
        slam[k] *= g
        slam[slam_n - 1 - k] *= g

    drop_dur = 0.5
    sub = [0.0] * n
    phase = 0.0
    for i in range(n):
        t = i / SR
        f = (180.0 + (32.0 - 180.0) * (t / drop_dur)) if t < drop_dur else 32.0
        sub[i] = math.sin(phase)
        phase += 2 * math.pi * f / SR

    decay = [math.exp(-max(0.0, (i / SR) - drop_dur) / 0.9) for i in range(n)]
    sub = [sub[i] * decay[i] * 0.9 for i in range(n)]

    samples = [0.0] * n
    add_at(samples, slam, 0)
    for i in range(n):
        samples[i] += sub[i]
    return samples, SR


# ---------------------------------------------------------------------------------------------
# WAV writing
# ---------------------------------------------------------------------------------------------

def write_wav(path, samples, sr, target_db=TARGET_PEAK_DB):
    peak = max((abs(s) for s in samples), default=0.0)
    gain = 1.0 if peak <= 1e-9 else (10.0 ** (target_db / 20.0)) / peak

    ints = [0] * len(samples)
    max_abs_int = 0
    for i, s in enumerate(samples):
        v = s * gain
        if v > 1.0:
            v = 1.0
        elif v < -1.0:
            v = -1.0
        iv = int(round(v * 32767.0))
        if iv > 32767:
            iv = 32767
        elif iv < -32768:
            iv = -32768
        ints[i] = iv
        if abs(iv) > max_abs_int:
            max_abs_int = abs(iv)

    arr = array.array("h", ints)
    if sys.byteorder != "little":
        arr.byteswap()

    with wave.open(path, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes(arr.tobytes())

    duration = len(samples) / float(sr)
    achieved_db = 20.0 * math.log10(max_abs_int / 32767.0) if max_abs_int > 0 else float("-inf")
    size = os.path.getsize(path)
    return duration, achieved_db, size


ASSETS = [
    ("whisper_loop", gen_whisper_loop),
    ("heartbeat_loop", gen_heartbeat_loop),
    ("emerge_hiss", gen_emerge_hiss),
    ("banish_stinger", gen_banish_stinger),
    ("dawn_chord", gen_dawn_chord),
    ("found_you", gen_found_you),
]


def main():
    print("=" * 64)
    print("generate_audio — Shadow Doors AudioKit placeholder set")
    print("=" * 64)

    if not os.path.isdir(AUDIO_DIR):
        os.makedirs(AUDIO_DIR)
        log(True, "created dir %s" % AUDIO_DIR)
    else:
        log(True, "dir exists %s" % AUDIO_DIR)

    # Fixed generation order (ASSETS table order) is what makes this deterministic run-to-run:
    # every generator's random.uniform() calls land at the same position in the single seeded
    # stream (seed 13, set once at import time).
    for name, gen_fn in ASSETS:
        filename = "%s.wav" % name
        path = os.path.join(AUDIO_DIR, filename)
        try:
            samples, sr = gen_fn()
            duration, achieved_db, size = write_wav(path, samples, sr)
            log(True, "%s written: %.2fs, peak=%.2f dBFS, %d bytes (%s)"
                % (filename, duration, achieved_db, size, path))
        except Exception as e:
            log(False, "%s: generation FAILED: %s" % (filename, e))

    print("-" * 64)
    if failures:
        print("SHADOWDOORS_AUDIO_GENERATED_FAILED: %d issue(s) - %s" % (len(failures), "; ".join(failures)))
        sys.exit(1)
    else:
        print("SHADOWDOORS_AUDIO_GENERATED")


main()
