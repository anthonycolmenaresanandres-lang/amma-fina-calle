# Colattao Owner Animation Translation Layer

## Purpose

Define how an illustrated Colattao owner character reference sheet should be used once the source file is uploaded and registered.

This layer exists to translate the real owner identity references into animation-friendly campaign visuals. It does not finalize owner identity.

## Source Of Truth

Real owner photos remain the identity source:

- `B001-A12` - `colattao owner.PNG`
- `B001-A14` - `i think profile owner.PNG`
- `B001-A15` - `side profile of the owner.PNG`
- `B001-A16` - `another of owner.PNG`

The owner identity lock remains:

```txt
COLATTAO_OWNER_IDENTITY_LOCK_V1:
partial
```

## Animated Reference Sheet Status

```txt
EXPECTED FILENAME:
colattao_owner_animated_character_reference_sheet_v1.png

CURRENT STATUS:
pending-upload

TARGET STATUS AFTER FILE IS FOUND AND VISUALLY CONFIRMED:
approved-candidate

ASSET CLASS:
owner animated character reference

PURPOSE:
animation translation layer

LIMITATION:
does not replace real owner identity references
```

## Useful Views Required

The illustrated sheet should provide:

- Front body.
- Back body.
- Close-up portrait.
- Consistent outfit.
- Consistent hair.
- Consistent body silhouette.
- Clean animation-friendly reference sheet.

## Allowed Use

After upload and visual confirmation, the sheet may be used for:

- Owner animation style translation.
- Posture and silhouette consistency.
- Outfit and hair continuity in animated scenes.
- Internal owner-led campaign planning.
- Preparing future owner intro frame exports.

## Forbidden Use

Do not use the illustrated sheet for:

- Final owner identity approval.
- Replacing real owner photo references.
- Inventing new facial details.
- Changing the V1 owner profile.
- Public owner-led generation without Anthony/client approval.
- Any output that implies final owner identity lock.

## Future Export Targets

Do not create these until the source sheet is uploaded and explicitly approved for processing:

- Portrait crop.
- Front body crop.
- Back body crop.
- `9:16` owner intro frame.
- Optional `1:1` master reference sheet.

## Registration Workflow

1. Save the illustrated sheet into a known approved asset folder.
2. Confirm exact filename and path.
3. Record dimensions and file size.
4. Visually confirm front body, back body, close-up portrait, consistent outfit, consistent hair, and consistent silhouette.
5. Mark status as `approved-candidate` only if it clearly matches the illustrated owner character reference sheet.
6. Keep `COLATTAO_OWNER_IDENTITY_LOCK_V1` marked partial.
7. Stop before processing/cropping until a separate processing task is approved.

## Next Action

Upload or save the file as:

```txt
C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/colattao_owner_animated_character_reference_sheet_v1.png
```

Then run a targeted registration pass to capture metadata and visual QA.
