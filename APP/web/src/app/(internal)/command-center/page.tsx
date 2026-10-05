import CommandCenterClient from "./CommandCenterClient";

// Preserve the existing URL-only, noindex hub and destination-level authorization.
export const metadata = {
  title: "Command Center - Fina Calle OS",
  robots: { index: false, follow: false },
};

export default function CommandCenterPage(): React.JSX.Element {
  return <CommandCenterClient />;
}
