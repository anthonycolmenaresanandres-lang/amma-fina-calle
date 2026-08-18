# QR Print Order and QA

> Complete in the approved private client record. Do not commit filled contact, vendor-payment, client, or credential data.

## Asset controls

```txt
QR ASSET ID:
USE: guest / owner-back-office
CANONICAL HTTPS DESTINATION:
DESTINATION VERIFIED AT:
VECTOR QR FILE:
PRESS-READY PDF:
RASTER PROOF:
FINAL FILE SHA-256:
REPLACEMENT RULE:
```

The owner QR may contain only `/owner/{safe-tenant-id}` on the canonical HTTPS domain. Never encode an email, password, magic link, token, session, PII, or tracking query.

## Starting specification

| Field | AMMA default | Approved order |
|---|---|---|
| Finished size | 3 × 3 inches | |
| Stock | durable opaque-white vinyl | |
| Finish | matte / low glare | |
| Adhesive | printer recommendation for the approved surface | |
| QR color | solid black on opaque white | |
| QR allocation | about 1.5 inches including quiet zone | |
| Quiet zone | four modules minimum | |
| Error correction | ECC Q | |
| Module size | at least 0.50 mm | |
| Master | vector SVG plus press-ready PDF | |
| Raster proof | 300 PPI minimum at final size | |
| Color mode / bleed | printer-confirmed before purchase | |
| Quantity | written approval required | |
| Placement | recorded surface, distance, angle, and lighting | |

Different sizes, table tents, window applications, laminates, curved surfaces, outdoor exposure, or long viewing distances require a new proof. Do not assume the default is suitable.

## Pre-purchase gate

- [ ] Written scope says who pays for printing.
- [ ] Quantity, price, taxes/shipping, vendor, material, finish, adhesive, and delivery date are approved.
- [ ] Destination returns the expected current content.
- [ ] QR decodes from the final press-ready artwork.
- [ ] Text, disclosures, safe margins, color/contrast, and final dimensions pass.
- [ ] One proof is authorized before the full run.

## Physical proof gate

- [ ] Printed at 100% / actual size.
- [ ] Scans on two different devices.
- [ ] Scans at the real placement distance, angle, and lighting.
- [ ] Matte/glare behavior is acceptable.
- [ ] Adhesive and surface are compatible.
- [ ] Destination and on-screen tenant identity are correct.
- [ ] Proof is accepted before remaining quantity is produced or placed.

## Delivery and reorder record

```txt
APPROVED QUANTITY:
DELIVERED QUANTITY:
DAMAGED / MISSING:
PLACEMENT COUNT:
PHYSICAL SCAN PASS DATE:
ACCEPTANCE EVIDENCE:
VENDOR / ORDER REFERENCE:
REORDER FILE HASH:
REORDER APPROVAL REQUIRED: yes
```

If the destination, disclosure, artwork, dimensions, material, or placement changes, stop and issue a new proof. Never silently reuse old stock.
