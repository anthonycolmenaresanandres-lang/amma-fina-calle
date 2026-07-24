# Approved QR Codes

## Rule

QR codes are overlays only. Never ask AI image or video models to generate QR codes. AI-generated QR codes are rejected because they may be unreadable, unsafe, or incorrect.

## Required QR Record

```txt
ASSET ID:
ASSET NAME:
SOURCE:
DATE ADDED:
STATUS: approved / pending / rejected / deprecated
INTENDED USE:
FORBIDDEN USE:
REPLACEMENT RULE:
OWNER / APPROVER:
FILE PATH / LOCATION:
DESTINATION URL:
DESTINATION VERIFIED: yes / no / pending
SCAN TEST RESULT:
NOTES:
```

## Current Records

### QR-PROSPECT-LAS-PALMAS-20260725

```txt
ASSET ID: QR-PROSPECT-LAS-PALMAS-20260725
ASSET NAME: Las Palmas private owner-review QR
SOURCE: local deterministic ReportLab generator
DATE ADDED: 2026-07-24
STATUS: approved
INTENDED USE: private Las Palmas owner-review leave-behind
FORBIDDEN USE: public advertising, implying client approval, or repointing the image
REPLACEMENT RULE: generate and register a new QR if the destination changes
OWNER / APPROVER: Anthony
FILE PATH / LOCATION: output/pdf/prospect-leave-behinds/2026-07-25/las-palmas/qr/las-palmas-owner-review.svg
DESTINATION URL: https://finacalleos.com/demo/las-palmas
DESTINATION VERIFIED: yes - HTTP 200, noindex, visible pending-client-approval notice
SCAN TEST RESULT: exact URL decoded from final 300-DPI PDF render with OpenCV on 2026-07-24
NOTES: SVG SHA-256 E4D9FE7965390AB0B4125E4188D9538FE08CFCB7861A8CA5092B4C077F97A18B. Re-scan the physical 100% print before placement.
```

### QR-PROSPECT-BODEGA-20260725

```txt
ASSET ID: QR-PROSPECT-BODEGA-20260725
ASSET NAME: Bodega Cafe private owner-review QR
SOURCE: local deterministic ReportLab generator
DATE ADDED: 2026-07-24
STATUS: approved
INTENDED USE: private Bodega Cafe owner-review leave-behind
FORBIDDEN USE: public advertising, implying client approval, or repointing the image
REPLACEMENT RULE: generate and register a new QR if the destination changes
OWNER / APPROVER: Anthony
FILE PATH / LOCATION: output/pdf/prospect-leave-behinds/2026-07-25/bodega/qr/bodega-owner-review.svg
DESTINATION URL: https://finacalleos.com/demo/bodega
DESTINATION VERIFIED: yes - HTTP 200, noindex, visible owner-review/prices-withheld notice
SCAN TEST RESULT: exact URL decoded from final 300-DPI PDF render with OpenCV on 2026-07-24
NOTES: SVG SHA-256 42AE5B26AD867F6DE54E1FEC052717BC2FA31744697F9E24F73E8FD9876E44C1. Re-scan the physical 100% print before placement.
```

### QR-PROSPECT-MARACAIBO-20260725

```txt
ASSET ID: QR-PROSPECT-MARACAIBO-20260725
ASSET NAME: Maracaibo Table 1 private owner-review QR
SOURCE: local deterministic ReportLab generator
DATE ADDED: 2026-07-24
STATUS: approved
INTENDED USE: private Maracaibo owner-review leave-behind
FORBIDDEN USE: public advertising, implying client approval, order/pay claims, or repointing the image
REPLACEMENT RULE: generate and register a new QR if the destination changes
OWNER / APPROVER: Anthony
FILE PATH / LOCATION: output/pdf/prospect-leave-behinds/2026-07-25/maracaibo/qr/maracaibo-owner-review.svg
DESTINATION URL: https://finacalleos.com/table/maracaibo/1
DESTINATION VERIFIED: yes - HTTP 200, noindex, visible prospect/owner-confirmation notice
SCAN TEST RESULT: exact URL decoded from final 300-DPI PDF render with OpenCV on 2026-07-24
NOTES: SVG SHA-256 41BE99211D96FA1264B99BD066FDCD52FBFE33CBE1904E40F654E625EDF5004B. Re-scan the physical 100% print before placement.
```

### QR-PROSPECT-AJ-GATORS-20260725

```txt
ASSET ID: QR-PROSPECT-AJ-GATORS-20260725
ASSET NAME: AJ Gator's private owner-review QR
SOURCE: local deterministic ReportLab generator
DATE ADDED: 2026-07-24
STATUS: pending
INTENDED USE: private AJ Gator's owner-review leave-behind after production verification
FORBIDDEN USE: placement before the route is live, public advertising, implying client approval, or repointing the image
REPLACEMENT RULE: generate and register a new QR if the destination changes
OWNER / APPROVER: Anthony
FILE PATH / LOCATION: output/pdf/prospect-leave-behinds/2026-07-25/aj-gators/qr/aj-gators-owner-review.svg
DESTINATION URL: https://finacalleos.com/demo/aj-gators
DESTINATION VERIFIED: pending production release
SCAN TEST RESULT: exact URL decoded from final 300-DPI PDF render with OpenCV on 2026-07-24
NOTES: SVG SHA-256 BCCCAB9776E443AA99778C48235B084D310AB3ECCD4B64F94A7DA89AE0B5388F. Approve only after live HTTP/content/noindex verification; re-scan the physical 100% print before placement.
```

## Replacement Rule

If the QR destination changes, create a new QR record. Do not reuse an old QR image for a new destination without explicit approval and scan testing.
