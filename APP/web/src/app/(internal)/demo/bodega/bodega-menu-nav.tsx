import { VenueMenuNav, type VenueMenuNavSection } from "@/venue-menu/VenueMenuNav";
import { BodegaVibraLink } from "./bodega-vibra-link";

const sections: VenueMenuNavSection[] = [
  { id: "fall-sessions", label: "Fall" },
  { id: "bodega-classics", label: "Classics" },
  { id: "signature-cafecito", label: "Cafecito" },
  { id: "non-coffee", label: "Non-coffee" },
  { id: "morning-bites", label: "Bites" },
  { id: "bakery-case", label: "Bakery" },
  { id: "hours", label: "Visit" },
];

export function BodegaMenuNav() {
  return <VenueMenuNav sections={sections} floatingAction={<BodegaVibraLink floating />} />;
}
