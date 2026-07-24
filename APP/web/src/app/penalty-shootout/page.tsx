import PenaltyClient from "./PenaltyClient";

export const metadata = {
  title: "Penalty Shootout | Fina Calle OS",
  description:
    "Street Shootout — a lightweight branded penalty mini-game built on the Fina Calle game engine pattern.",
};

type PageProps = { searchParams?: Promise<{ skin?: string }> };

export default async function PenaltyShootoutPage({
  searchParams,
}: PageProps): Promise<React.JSX.Element> {
  // Optional deep link (?skin=colattao|laspalmas|…) so a demo page can open the
  // game pre-set to a client skin. Unknown ids fall back to the default skin.
  const { skin } = searchParams ? await searchParams : {};
  return <PenaltyClient initialSkinId={skin} />;
}
