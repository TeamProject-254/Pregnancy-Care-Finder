import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number, props: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  ...props,
});

export const BackIcon = ({ size = 16, ...props }: IconProps) => (
  <svg {...base(size, props)}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

export const BriefcaseIcon = ({ size = 22, ...props }: IconProps) => (
  <svg {...base(size, props)}>
    <rect x="3" y="7.5" width="18" height="12" rx="3" />
    <path d="M9 7.5V6a2 2 0 012-2h2a2 2 0 012 2v1.5M3 13h18" />
  </svg>
);

export const PinIcon = ({ size = 22, ...props }: IconProps) => (
  <svg {...base(size, props)}>
    <path d="M12 3l6.5 17-6.5-3.8L5.5 20 12 3z" />
  </svg>
);

export const GlobeIcon = ({ size = 22, ...props }: IconProps) => (
  <svg {...base(size, props)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
  </svg>
);

export const ServiceIcon = ({ size = 16, ...props }: IconProps) => (
  <svg {...base(size, props)}>
    <rect x="5" y="4.5" width="14" height="16" rx="3" />
    <path d="M9 4.5V3.5h6v1M9 12h6M12 9v6" />
  </svg>
);

export const CalendarSmallIcon = ({ size = 16, ...props }: IconProps) => (
  <svg {...base(size, props)}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
    <path d="M8 3v4M16 3v4M3.5 10h17" />
  </svg>
);

export const ClockSmallIcon = ({ size = 16, ...props }: IconProps) => (
  <svg {...base(size, props)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const WalletIcon = ({ size = 16, ...props }: IconProps) => (
  <svg {...base(size, props)}>
    <rect x="3" y="6" width="18" height="13" rx="3" />
    <path d="M3 10.5h18M7 15h3" />
  </svg>
);

export const ChevronIcon = ({ size = 16, ...props }: IconProps) => (
  <svg {...base(size, props)}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);
