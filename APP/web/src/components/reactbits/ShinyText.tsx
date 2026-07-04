// Vendored React Bits-style "Shiny Text": a slow gold shimmer sweeping
// across the text via background-clip. Pure CSS (see .rb-shiny-text in
// globals.css) so it server-renders; reduced-motion visitors get the
// plain solid-color text.

export default function ShinyText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={`rb-shiny-text ${className ?? ""}`}>{children}</span>;
}
