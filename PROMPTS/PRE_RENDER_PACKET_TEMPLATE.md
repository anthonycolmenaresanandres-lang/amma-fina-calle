# Pre-Render Packet Template

## Purpose

Use this packet before any AI image/video render batch. If a field is blank, the shot is not ready.

```txt
PROJECT NAME:
[Project/client/campaign]

SHOT ID:
[S01]

CHARACTER LOCK USED:
[Path or none]

ENVIRONMENT LOCK USED:
[Path or none]

APPROVED REFERENCES:
[Image/video/reference paths]

PROMPT STRING:
[IDENTITY LOCK] + [WARDROBE/PROP LOCK] + [SUBJECT ACTION] + [Z-AXIS PLACEMENT] + [CAMERA] + [LIGHTING SOURCE] + [ATMOSPHERE] + [STYLE/TEXTURE] + [FORMAT] + [NEGATIVE BLOCK]

NEGATIVE BLOCK:
[Negative identity and production constraints]

MOTION TYPE:
Camera motion / subject motion / atmosphere-only / static

CAMERA MOVEMENT:
[Static, slow push-in, tilt, etc.]

LIGHTING SOURCE:
[Direction, quality, color]

OUTPUT FORMAT:
[9:16 still, 9:16 3-5 second clip, PNG, WebP, etc.]

OVERLAY ASSETS NEEDED:
[Logo PNG/vector, QR PNG/SVG, menu screenshot, caption, CTA]

QA CHECKLIST:
- Character consistency
- Environment consistency
- Logo/text safety
- Mobile readability
- Brand language
- Motion stability
- Human skin realism
- Prompt compliance

APPROVAL STATUS:
Draft / ready to render / rendered for QA / approved / rejected
```
