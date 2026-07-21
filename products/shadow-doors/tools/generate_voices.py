#!/usr/bin/env python3
# Shadow Doors — voice + chant generation (Anthony's direction, 2026-07-20):
#   * chant_loop.wav        — Gregorian-style background: 4-voice organum drone (pure synth,
#                             wordless — placeholder for a licensed recorded chant later)
#   * demonic_voice_a/b.wav — demonic spoken lines for late-run emerges
#   * main_voice_lose.wav   — THE main voice, spoken from inside the black at the end
#   * main_voice_dawn.wav   — the parting whisper on a win
#
# Spoken lines are synthesized with espeak-ng (deterministic for fixed args) and then
# demonized with stdlib DSP: pitch-drop resampling, detuned unison layering, a sub-octave
# double, syllabic growl AM, soft-clip saturation, and a feedback-delay tail.
# If espeak-ng is absent the voice files are SKIPPED with [!!] (the committed WAVs remain
# authoritative); the chant is pure stdlib and always regenerates. Deterministic: fixed
# seed, fixed args; output normalized to -3 dBFS, 44.1 kHz 16-bit mono.
#
# Run:  python3 tools/generate_voices.py   ->  Assets/ShadowDoors/Audio/*.wav
# Token: SHADOWDOORS_VOICES_GENERATED (or _PARTIAL if espeak-ng was unavailable)

import math
import os
import random
import shutil
import struct
import subprocess
import sys
import tempfile
import wave

random.seed(31)

SAMPLE_RATE = 44100
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.normpath(os.path.join(SCRIPT_DIR, "..", "Assets", "ShadowDoors", "Audio"))

PARTIAL = False


def log(ok, msg):
    print(("[OK] " if ok else "[!!] ") + msg)


# ---------------------------------------------------------------------------
# WAV I/O + DSP helpers (stdlib only; conventions match tools/generate_audio.py)
# ---------------------------------------------------------------------------

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
    log(True, "%s  %.2fs  %d bytes" % (name, len(samples) / SAMPLE_RATE, os.path.getsize(path)))


def read_wav_mono(path):
    with wave.open(path, "r") as w:
        rate = w.getframerate()
        channels = w.getnchannels()
        width = w.getsampwidth()
        raw = w.readframes(w.getnframes())
    if width != 2:
        raise RuntimeError("expected 16-bit wav from espeak, got width=%d" % width)
    total = len(raw) // 2
    ints = struct.unpack("<%dh" % total, raw)
    if channels > 1:
        ints = ints[::channels]
    samples = [v / 32768.0 for v in ints]
    if rate != SAMPLE_RATE:
        # naive linear resample to 44.1k
        ratio = rate / SAMPLE_RATE
        out = []
        pos = 0.0
        while int(pos) + 1 < len(samples):
            i = int(pos)
            frac = pos - i
            out.append(samples[i] * (1 - frac) + samples[i + 1] * frac)
            pos += ratio
        samples = out
    return samples


def resample_pitch(samples, factor):
    """factor < 1.0 -> deeper + slower (classic demon drop)."""
    out = []
    pos = 0.0
    while int(pos) + 1 < len(samples):
        i = int(pos)
        frac = pos - i
        out.append(samples[i] * (1 - frac) + samples[i + 1] * frac)
        pos += factor
    return out


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


def mix_into(base, add, offset_samples=0, gain=1.0):
    needed = offset_samples + len(add)
    if needed > len(base):
        base.extend([0.0] * (needed - len(base)))
    for i, s in enumerate(add):
        base[offset_samples + i] += s * gain
    return base


def soft_clip(samples, drive=1.6):
    return [math.tanh(s * drive) for s in samples]


def feedback_delay(samples, delay_ms=210, feedback=0.42, mix=0.35, tail_s=1.2):
    delay_n = int(SAMPLE_RATE * delay_ms / 1000.0)
    out = list(samples) + [0.0] * int(SAMPLE_RATE * tail_s)
    for i in range(delay_n, len(out)):
        out[i] += out[i - delay_n] * feedback * mix
    return out


def growl_am(samples, rate_hz=4.2, depth=0.55):
    """Syllabic amplitude modulation — the 'speaking through a growl' texture."""
    out = []
    for i, s in enumerate(samples):
        t = i / SAMPLE_RATE
        m = 1.0 - depth * (0.5 + 0.5 * math.sin(2 * math.pi * rate_hz * t + math.sin(t * 2.3) * 1.7))
        out.append(s * m)
    return out


def demonize(samples, pitch=0.62, sub_gain=0.55, detunes=(0.985, 1.0, 1.018), growl=True):
    voiced = resample_pitch(samples, pitch)
    layered = []
    for d in detunes:
        layer = resample_pitch(voiced, d)
        layered = mix_into(layered, layer, 0, 1.0 / len(detunes))
    sub = resample_pitch(voiced, 0.5)
    layered = mix_into(layered, one_pole_lowpass(sub, 300), 0, sub_gain)
    if growl:
        layered = growl_am(layered)
    layered = soft_clip(layered, 1.8)
    wet = feedback_delay(one_pole_lowpass(layered, 3200))
    return trim_tail(wet)


def trim_tail(samples, threshold=0.004, keep_s=0.35):
    """Cut trailing near-silence, keeping a short natural tail."""
    last = len(samples) - 1
    while last > 0 and abs(samples[last]) < threshold:
        last -= 1
    return samples[:min(len(samples), last + int(keep_s * SAMPLE_RATE))]


# ---------------------------------------------------------------------------
# espeak-ng spoken lines
# ---------------------------------------------------------------------------

def espeak_line(text, pitch=18, speed=105, voice="en-us+m3"):
    exe = shutil.which("espeak-ng") or shutil.which("espeak")
    if exe is None:
        return None
    tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    tmp.close()
    try:
        subprocess.run([exe, "-v", voice, "-p", str(pitch), "-s", str(speed),
                        "-w", tmp.name, text], check=True, capture_output=True)
        return read_wav_mono(tmp.name)
    finally:
        os.unlink(tmp.name)


def make_voice(name, text, pitch_factor, growl, espeak_pitch=18, speed=105):
    global PARTIAL
    dry = espeak_line(text, pitch=espeak_pitch, speed=speed)
    if dry is None:
        PARTIAL = True
        log(False, "%s SKIPPED — espeak-ng not available on this machine (committed WAV remains authoritative)" % name)
        return
    write_wav(name, demonize(dry, pitch=pitch_factor, growl=growl))


def make_pleading_voice(name, text, espeak_pitch=60, speed=95):
    """The frightened HUMAN whisper that begs the player not to take the coins —
    deliberately NOT demonized: the contrast (someone tried to warn you) is the point.
    espeak's +whisper variant + gentle lowpass + a small room tail."""
    global PARTIAL
    dry = espeak_line(text, pitch=espeak_pitch, speed=speed, voice="en-us+whisper")
    if dry is None:
        PARTIAL = True
        log(False, "%s SKIPPED — espeak-ng not available on this machine (committed WAV remains authoritative)" % name)
        return
    wet = feedback_delay(one_pole_lowpass(dry, 4000), delay_ms=140, feedback=0.30, mix=0.20, tail_s=0.6)
    write_wav(name, trim_tail(wet))


# ---------------------------------------------------------------------------
# Gregorian-style chant: 4-voice wordless organum (pure synth)
# ---------------------------------------------------------------------------

def chant_voice(freqs_seq, note_seconds, vowel_formants, gain=1.0, detune=1.0):
    out = []
    phase = 0.0
    for freq in freqs_seq:
        f = freq * detune
        n = int(note_seconds * SAMPLE_RATE)
        attack = int(0.35 * SAMPLE_RATE)
        for i in range(n):
            t = i / SAMPLE_RATE
            # additive "voice": fundamental + formant-weighted partials (ah/oh-ish)
            s = math.sin(phase)
            for k, (mult, w) in enumerate(vowel_formants):
                s += w * math.sin(phase * mult + k)
            env = min(1.0, i / attack, (n - i) / attack)
            # slow sacred vibrato
            vib = 1.0 + 0.004 * math.sin(2 * math.pi * 4.7 * t)
            phase += 2 * math.pi * f * vib / SAMPLE_RATE
            out.append(s * env * gain)
    return out


def build_chant():
    # Phrygian-flavored root D2/D3 organum: bass drone, fifth, octave melody, tenth shimmer.
    d3 = 146.83
    # 8 slow notes x 2.5 s = 20 s loop; melody wanders the mode and returns home.
    melody = [d3 * r for r in (1.0, 1.0667, 1.2, 1.0667, 1.3333, 1.2, 1.0667, 1.0)]
    drone = [d3 * 0.5] * 8
    fifth = [f * 1.5 for f in drone]
    tenth = [f * 2.4 for f in [d3] * 8]
    ah = [(2.0, 0.35), (3.0, 0.22), (4.0, 0.10)]
    oh = [(2.0, 0.20), (3.0, 0.10), (5.0, 0.05)]

    mixdown = []
    mixdown = mix_into(mixdown, chant_voice(drone, 2.5, oh, 0.9, 1.0), 0)
    mixdown = mix_into(mixdown, chant_voice(fifth, 2.5, oh, 0.5, 0.9985), 0)
    mixdown = mix_into(mixdown, chant_voice(melody, 2.5, ah, 0.7, 1.0015), 0)
    mixdown = mix_into(mixdown, chant_voice(tenth, 2.5, ah, 0.18, 1.003), 0)
    wet = feedback_delay(one_pole_lowpass(mixdown, 2400), delay_ms=340, feedback=0.5, mix=0.4, tail_s=0.0)
    loop_n = int(20.0 * SAMPLE_RATE)
    body = wet[:loop_n]
    # endpoint-match: crossfade the final 0.5 s with the opening 0.5 s
    fade_n = int(0.5 * SAMPLE_RATE)
    for i in range(fade_n):
        a = i / fade_n
        body[loop_n - fade_n + i] = body[loop_n - fade_n + i] * (1 - a) + wet[i] * a if i < len(wet) else body[loop_n - fade_n + i]
    write_wav("chant_loop.wav", body)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    build_chant()
    # The demonic emerge voices — short, intelligible-but-wrong.
    make_voice("demonic_voice_a.wav", "Come closer.", pitch_factor=0.60, growl=True)
    make_voice("demonic_voice_b.wav", "We see you.", pitch_factor=0.58, growl=True, espeak_pitch=14)
    # THE main voice — speaks from inside the black before the end card. Slower, deeper,
    # less growl: it doesn't need to snarl, it has already won.
    make_voice("main_voice_lose.wav", "You are ours now.", pitch_factor=0.55, growl=False, espeak_pitch=10, speed=88)
    # The parting whisper on a win: dawn came, but it is not gone.
    make_voice("main_voice_dawn.wav", "For now.", pitch_factor=0.70, growl=False, espeak_pitch=25, speed=92)
    # The Offering (hook take 2): a frightened human whisper begs the player not to
    # take the coins; the final line is the entity itself — the turn.
    make_pleading_voice("please_dont.wav", "Please. Don't.", espeak_pitch=60, speed=90)
    make_pleading_voice("leave_them.wav", "Leave them. They are not yours.", espeak_pitch=55, speed=100)
    make_voice("it_knows.wav", "It knows what you took.", pitch_factor=0.60, growl=True, espeak_pitch=14, speed=95)
    print("SHADOWDOORS_VOICES_GENERATED" + ("_PARTIAL" if PARTIAL else ""))


if __name__ == "__main__":
    main()
