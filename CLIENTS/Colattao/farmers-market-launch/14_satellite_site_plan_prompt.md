# Satellite Site Plan Generation Prompt

Purpose: create an accurate site-plan graphic for Yury / Colattao owner using a Google satellite screenshot or equivalent site screenshot as the base reference.

## Required Inputs

1. Google Maps satellite screenshot of:
   - Colattao Coffee House
   - 1115 Independence Blvd Suite 101/102, Virginia Beach, VA 23455
   - the full yellow parking-space patch
   - the storefront row
   - nearest drive aisles
   - surrounding parking spaces
   - tenant entrances if visible
2. Optional second screenshot zoomed out to show:
   - Independence Blvd
   - Haygood Road / shopping-center access
   - main entry/exit points
3. Optional phone photos from the site walk:
   - front of Colattao
   - yellow parking spaces
   - drive aisle
   - tenant entrances
   - accessible parking/ramp locations

## Screenshot Instructions

Use Google Maps satellite view. Zoom until individual parking spaces are clearly visible. Keep the screenshot north-up if possible. Do not crop out the drive aisles around the yellow patch.

Take two screenshots:

- `map-01-close-yellow-zone.png`: close view of yellow patch, Colattao storefront, drive aisle, and adjacent parking.
- `map-02-plaza-context.png`: wider view of the plaza access points and surrounding parking.

## Image / Diagram Prompt

Use this prompt with the uploaded satellite screenshot as the reference image:

```
Create a clean, professional site-plan overlay for a proposed small arts-and-crafts bazaar at Colattao Coffee House, 1115 Independence Blvd Suite 101/102, Virginia Beach, VA 23455.

Use the uploaded Google satellite screenshot as the exact base reference. Do not invent or redraw the property from memory. Preserve the visible building footprint, storefront row, parking-space geometry, drive aisles, entrances, and parking layout as accurately as possible.

Goal:
Show how the highlighted yellow parking-space patch would be temporarily closed and used as the main vendor-table bazaar zone for the Colattao Community Market pilot.

Style:
- Clean municipal / landlord review style.
- Use semi-transparent overlays so the satellite base remains visible.
- Use simple labels, arrows, and a legend.
- Do not make it look like a marketing flyer.
- Avoid decorative graphics.
- Make it readable when printed on 8.5x11 paper.

Required labels and overlays:
1. "YELLOW BAZAAR ZONE - proposed temporary parking-space closure"
   - Mark the yellow parking-space patch as the main vendor table area.
   - Use a translucent yellow fill with a bold yellow/orange outline.
   - Add small table icons or numbered dots for 8-12 vendor tables if space allows.

2. "Colattao Coffee House / indoor approved food"
   - Mark the Colattao storefront.
   - Show that cooked/prepared food should be directed inside approved tenants or separately approved food trucks only.

3. "Vendor check-in + QR directory"
   - Place this at the entrance edge of the yellow bazaar zone nearest Colattao.

4. "Drive aisles - keep clear"
   - Mark visible drive aisles with blue arrows.
   - Do not place booths in drive aisles.

5. "Fire / emergency access - keep clear"
   - Mark the likely emergency access route with red dashed arrows.
   - If the exact fire lane is not visible, label it "confirm fire lane on site walk".

6. "Tenant entrances - keep clear"
   - Mark the storefront entrance line.
   - Label key neighboring tenants if visible or known: US Air Force Recruiting, Army Recruiting, Nara Sushi, Hair By the C, Dave's Toys and Collectibles, Paris Nails Spa, Subway, Fox Music, Register Link.
   - If exact suite positions are uncertain, label the row as "tenant entrances - exact suite positions to confirm".

7. "Customer parking - preserve"
   - Mark parking areas outside the yellow closure that should remain available for tenant/customer parking.

8. "Vendor loading / unloading"
   - Mark a proposed load-in path with green arrows.
   - Add note: "7:30-8:30 AM load-in; vehicles move to approved vendor parking before 9 AM".

9. "Accessible parking / ramps - do not use"
   - If visible, mark accessible parking and ramps in purple.
   - If not visible, add note: "accessible spaces/ramps to confirm during site walk; never use for booths".

10. "Overflow vendor edge - optional only if approved"
   - If there is an obvious safe parking-lot edge, mark it lightly with a dashed green outline.
   - Label as optional / future only, not part of first approval unless property manager approves.

Legend:
- Yellow = proposed bazaar table zone
- Blue arrows = drive aisles kept open
- Red dashed arrows = fire/emergency access kept open
- Purple = ADA/accessibility protected areas
- Green = vendor loading / optional overflow
- Gray = customer parking preserved

Important notes to include on the diagram:
- "Draft for landlord/city/fire review - not final approval."
- "No public event date until property manager, zoning/city, fire, and health path are confirmed."
- "Cooked food inside approved tenants or separately approved food trucks only."
- "Do not block drive aisles, fire lanes, tenant entrances, sidewalks, ramps, or accessible parking."

Output:
- 8.5x11 landscape site plan.
- High-resolution PNG and PDF.
- Keep labels readable.
- Make the yellow closure zone the visual focus.
```

## Optional Follow-Up Prompt For A Cleaner Black-And-White Print Version

```
Create a simplified black-and-white landlord review version of the same site plan. Keep the satellite screenshot faint in grayscale. Use numbered callouts instead of colored overlays:
1 = proposed yellow bazaar zone / temporary parking closure
2 = Colattao Coffee House
3 = vendor check-in / QR directory
4 = drive aisles kept clear
5 = fire/emergency access kept clear
6 = tenant entrances kept clear
7 = customer parking preserved
8 = vendor loading route
9 = ADA/accessibility areas to protect

Keep it clean, printable, and easy to review with the property manager.
```

## Accuracy Rules

- Do not claim fire lane, accessible parking, or tenant entrance positions are final unless confirmed on site.
- If the screenshot does not clearly show a feature, label it "confirm during site walk."
- Do not show cooked-food tables in the yellow bazaar zone.
- Do not draw vendor tables into drive aisles.
- Do not use accessible spaces for booths.
- Do not crop out the route emergency vehicles would need.

