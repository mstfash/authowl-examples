type IconProps = { size?: number };

export function OwlMark({ size = 28, idPrefix = 'owl' }: IconProps & { idPrefix?: string }) {
  const gold = `${idPrefix}-gold`;
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" role="img" aria-label="AuthOwl">
      <defs>
        <linearGradient id={gold} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFDD97" />
          <stop offset=".55" stopColor="#F5B84C" />
          <stop offset="1" stopColor="#C9852A" />
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx="22" fill="#100B06" />
      <rect x="1.25" y="1.25" width="93.5" height="93.5" rx="20.75" fill="none" stroke="#F5B84C" strokeOpacity=".24" strokeWidth="1.5" />
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

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export function SunIcon({ size = 17 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </svg>
  );
}

export function MoonIcon({ size = 17 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z" />
    </svg>
  );
}

export function HeartIcon({ size = 15, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      {...stroke}
      fill={filled ? 'currentColor' : 'none'}
      aria-hidden="true"
    >
      <path d="M12 20s-7-4.4-7-9.3A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7 2.7C19 15.6 12 20 12 20Z" />
    </svg>
  );
}

export function PencilIcon({ size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <path d="M4 20h4L19 9a2.5 2.5 0 0 0-3.5-3.5L4 16.5V20Z" />
      <path d="M14.5 6.5 17.5 9.5" />
    </svg>
  );
}

export function TrashIcon({ size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
    </svg>
  );
}

export function BackIcon({ size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export function PlusIcon({ size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth={2.2} aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
