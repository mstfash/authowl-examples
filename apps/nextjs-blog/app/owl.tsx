/** The AuthOwl mark, inlined so the app ships zero image requests. */
export function OwlMark({ size = 30, idPrefix = 'owl' }: { size?: number; idPrefix?: string }) {
  const gold = `${idPrefix}-gold`;
  const night = `${idPrefix}-night`;

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" role="img" aria-label="AuthOwl">
      <defs>
        <linearGradient id={gold} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFDD97" />
          <stop offset=".55" stopColor="#F5B84C" />
          <stop offset="1" stopColor="#C9852A" />
        </linearGradient>
        <linearGradient id={night} x1="0" y1="0" x2="0" y2="96" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#161009" />
          <stop offset="1" stopColor="#0B0906" />
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx="22" fill={`url(#${night})`} />
      <rect
        x="1.25"
        y="1.25"
        width="93.5"
        height="93.5"
        rx="20.75"
        fill="none"
        stroke="#F5B84C"
        strokeOpacity=".22"
        strokeWidth="1.5"
      />
      <g transform="translate(9.6,15) scale(1.2)">
        <path
          d="M32 3c-5 0-9 2.5-11.5 6C17 7 12 7.5 9 11c2 .5 3.4 1.6 4.2 3C8.5 16.6 5 21.7 5 28c0 12.7 12 24 27 24s27-11.3 27-24c0-6.3-3.5-11.4-8.2-14 .8-1.4 2.2-2.5 4.2-3-3-3.5-8-4-11.5-2C41 5.5 37 3 32 3Z"
          fill={`url(#${gold})`}
        />
        <circle cx="23" cy="28" r="10" fill="#0b0906" />
        <circle cx="41" cy="28" r="10" fill="#0b0906" />
        <circle cx="23" cy="28" r="4.6" fill={`url(#${gold})`} />
        <circle cx="41" cy="28" r="4.6" fill={`url(#${gold})`} />
        <path d="M32 34l3.2 5.4h-6.4Z" fill="#C9852A" />
      </g>
    </svg>
  );
}
