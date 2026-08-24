export function LogoMark({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 240" className={className} role="img" aria-label="MP MedPharma">
      <defs>
        <linearGradient id="logoMarkInk" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1B2C42" />
          <stop offset="100%" stopColor="#060B14" />
        </linearGradient>
        <linearGradient id="logoMarkBeam" gradientUnits="userSpaceOnUse" x1="86" y1="170" x2="154" y2="170">
          <stop offset="0%" stopColor="#D9BD82" stopOpacity="0" />
          <stop offset="12%" stopColor="#D9BD82" stopOpacity="0.9" />
          <stop offset="88%" stopColor="#FBEFD3" stopOpacity="1" />
          <stop offset="100%" stopColor="#FBEFD3" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="120" cy="120" r="118" fill="url(#logoMarkInk)" />
      <circle cx="120" cy="120" r="100" fill="none" stroke="#D9BD82" strokeWidth="2" />
      <text
        x="120"
        y="146"
        textAnchor="middle"
        fontFamily="var(--font-display), Georgia, serif"
        fontWeight="600"
        fontSize="92"
        letterSpacing="2"
        fill="#E4CB98"
      >
        MP
      </text>

      {/* laser-beam accent: stacked strokes simulate a glow without filter primitives */}
      <line x1="86" y1="170" x2="154" y2="170" stroke="url(#logoMarkBeam)" strokeWidth="7" strokeLinecap="round" opacity="0.35" />
      <line x1="87" y1="170" x2="153" y2="170" stroke="url(#logoMarkBeam)" strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
      <line x1="88" y1="170" x2="152" y2="170" stroke="url(#logoMarkBeam)" strokeWidth="1.4" strokeLinecap="round" />

      <circle cx="152" cy="170" r="2.6" fill="#FBEFD3" />
      <circle cx="152" cy="170" r="5.5" fill="#FBEFD3" opacity="0.25" />
      <g stroke="#FBEFD3" strokeWidth="1" strokeLinecap="round" opacity="0.85">
        <line x1="152" y1="162" x2="152" y2="165.5" />
        <line x1="152" y1="174.5" x2="152" y2="178" />
        <line x1="144" y1="170" x2="147.5" y2="170" />
        <line x1="156.5" y1="170" x2="160" y2="170" />
      </g>
    </svg>
  );
}
