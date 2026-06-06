# Free Tooling Install And Verify Prompt

## Purpose

Future Codex prompt for checking whether the local/free Campaign Autopilot tools are installed on Windows.

This prompt is verification-only by default. It must report missing tools and must not install anything unless Anthony explicitly approves installation.

## Prompt

```txt
Codex effort: MEDIUM

Scope:
Local tool availability verification only. Do not modify app code, routes, deployments, configs, package files, secrets, API files, image assets, or Colattao Rush code. Do not install tools unless explicitly approved in this same prompt. Do not call paid APIs.

Work in:
C:\Users\antho\OneDrive\Desktop\AMMA Ventures LLC DBA Fina Calle

Goal:
Check whether the free/local Campaign Autopilot tools are available:
- rembg
- ImageMagick
- FFmpeg
- Upscayl
- SAM 2 optional

Run Windows-friendly checks:

1. rembg:
   where rembg
   rembg --version

2. ImageMagick:
   where magick
   magick -version

3. FFmpeg:
   where ffmpeg
   ffmpeg -version

4. Upscayl:
   where upscayl

5. SAM 2 optional:
   python -c "import sam2; print('sam2 available')"

Rules:
- Report missing tools.
- Do not install anything unless explicitly approved.
- Do not process images.
- Do not call APIs.
- Do not modify files unless the task explicitly asks to write a verification report.
- If a command is unavailable, record it as missing and continue.

Report:
1. Tool availability table.
2. Version output if available.
3. Missing tools.
4. Recommended install path for missing tools, but do not install.
5. Confirmation no files were modified.
```

## Recommended Install Notes For Future Approval

These are reference notes only. Do not execute unless Anthony approves installation.

### rembg

Possible install path:

```powershell
python -m pip install rembg
```

### ImageMagick

Possible install path:

```powershell
winget install ImageMagick.ImageMagick
```

### FFmpeg

Possible install path:

```powershell
winget install Gyan.FFmpeg
```

### Upscayl

Possible install path:

```powershell
winget install Upscayl.Upscayl
```

### SAM 2

SAM 2 is optional and advanced. Installation depends on Python, PyTorch, hardware support, and model files. Do not install in normal first-pass workflows.

## Safety Rules

- No paid API calls without approval.
- No image processing in verification mode.
- No generated logos.
- No generated QR codes.
- No baked-in CTA, menu, pricing, or legal text.
- Preserve original seller/client asset identity.
- If local tools are unavailable, document the missing dependency and stop safely.
