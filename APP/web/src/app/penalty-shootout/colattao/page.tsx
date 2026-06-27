import PenaltyClient from "../PenaltyClient";

export const metadata = {
  title: "Colattao Penalty Rush | Fina Calle OS",
  description:
    "A Colattao match-day penalty mini-game for Colombia vs Portugal.",
};

export default function ColattaoPenaltyShootoutPage(): React.JSX.Element {
  return (
    <PenaltyClient
      defaultSkinId="colattao"
      eyebrow="Colombia vs Portugal Match Day"
      title="Colattao Penalty Rush"
      subtitle="Five from the spot. Pick your keeper, play for Colattao, then check the menu."
      lockSkin
      menuHref="/m/colattao"
      menuLabel="View Colattao menu"
    />
  );
}
