import MenuExperience from "./MenuExperience";

export default async function ElMariachiPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Reading the request allows the full selected menu to be rendered on the server.
  await searchParams;
  return <MenuExperience />;
}
