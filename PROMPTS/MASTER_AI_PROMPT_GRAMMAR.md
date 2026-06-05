# Master AI Prompt Grammar

## Universal Structure

Use this grammar for Fina Calle OS AI image/video prompts:

```txt
[IDENTITY LOCK] + [WARDROBE/PROP LOCK] + [SUBJECT ACTION] + [Z-AXIS PLACEMENT] + [CAMERA] + [LIGHTING SOURCE] + [ATMOSPHERE] + [STYLE/TEXTURE] + [FORMAT] + [NEGATIVE BLOCK]
```

## Required Rules

- Identity lock always comes first.
- Only one primary motion per shot.
- Every prompt must include aspect ratio.
- Every prompt must include lighting direction.
- Every prompt must include negative identity block for character shots.
- Never include generated text, logos, QR codes, or menu copy inside image/video model prompts.

## Field Definitions

### Identity Lock

Use the approved identity lock exactly. Do not summarize or beautify it.

### Wardrobe/Prop Lock

State approved wardrobe, armor, owner wardrobe, props, or menu/device assets. Do not invent brand assets.

### Subject Action

One clear action only.

### Z-Axis Placement

Define foreground, midground, and background.

### Camera

Use static, slow push-in, slow tilt, locked-off, close-up, extreme close-up, or another simple camera grammar.

### Lighting Source

State direction and quality: top right lightning, warm practical from left, cold rim light from behind, etc.

### Atmosphere

Use fog, rain, darkness, smoke, shallow depth of field, dust, steam, or other masking tools when useful.

### Style/Texture

Define realism and medium: cinematic realism, 16mm film, gritty texture, human skin texture, documentary detail.

### Format

State output: 9:16 aspect ratio, 3-5 second clip, still image, WebP, PNG, etc.

### Negative Block

Include negative identity and production constraints.

## Forbidden Prompt Content

Do not ask models to generate:

- Readable logos.
- QR codes.
- Menu text.
- Brand marks.
- Legal claims.
- Prices or hours.
- Final campaign typography.

All logos, text, QR codes, menu words, and brand marks must be static overlays in final editing.
