import LeadArcadeClient from "./LeadArcadeClient";

export const metadata = {
  title: "Fina Calle Conquest — Lead Arcade",
  robots: { index: false, follow: false },
};

export default function LeadArcadePage(): React.JSX.Element {
  return <LeadArcadeClient />;
}
