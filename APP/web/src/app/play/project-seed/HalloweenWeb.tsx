const angles = [0, 15, 30, 45, 60, 75, 90];
const point = (radius: number, degrees: number) => {
  const angle = degrees * Math.PI / 180;
  return `${(Math.cos(angle) * radius).toFixed(1)} ${(Math.sin(angle) * radius).toFixed(1)}`;
};

function webRing(radius: number) {
  return `M${point(radius, 0)} ${angles.slice(1).map((angle) => `Q${point(radius * 0.85, angle - 7.5)} ${point(radius, angle)}`).join(" ")}`;
}

export function HalloweenWeb({ className, spider = false }: { className: string; spider?: boolean }) {
  return <svg className={className} viewBox="0 0 320 400" aria-hidden="true" focusable="false" fill="none">
    <g stroke="currentColor" strokeWidth="1.15" strokeLinecap="round">
      {angles.map((angle) => <path key={angle} d={`M0 0L${point(300, angle)}`} />)}
      {[40, 78, 120, 168, 220, 278].map((radius) => <path key={radius} d={webRing(radius)} />)}
      {spider ? <g>
        <path d="M214 83V314" strokeWidth=".8" />
        <path d="M210 324L198 313L195 299M210 327L194 323L187 311M210 331L197 337L193 350M218 324L230 313L233 299M218 327L234 323L241 311M218 331L231 337L235 350" strokeWidth="2.2" />
        <ellipse cx="214" cy="329" rx="6.5" ry="9" fill="currentColor" stroke="none" />
        <circle cx="214" cy="318" r="4" fill="currentColor" stroke="none" />
      </g> : null}
    </g>
  </svg>;
}
