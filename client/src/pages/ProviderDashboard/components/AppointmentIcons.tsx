import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number, props: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  ...props,
});

export const SearchIcon = ({ size = 24, ...props }: IconProps) => (
  <svg {...base(size, props)}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

export const CalendarIcon = ({ size = 24, ...props }: IconProps) => (
  <svg {...base(size, props)}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
    <path d="M8 3v4M16 3v4M3.5 10h17" />
  </svg>
);

export const FilterIcon = ({ size = 24, ...props }: IconProps) => (
  <svg {...base(size, props)}>
    <path d="M4 7h16M7 12h10M10 17h4" />
  </svg>
);

export const ChevronDownIcon = ({ size = 16, ...props }: IconProps) => (
  <svg {...base(size, props)}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export const ClockIcon = ({ size = 24, ...props }: IconProps) => (
  <svg {...base(size, props)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const CheckCircleIcon = ({ size = 24, ...props }: IconProps) => (
  <svg {...base(size, props)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.5l2.7 2.7L16 9.5" />
  </svg>
);

export const TrashIcon = ({ size = 24, ...props }: IconProps) => (
  <svg {...base(size, props)}>
    <path d="M4 7h16M10 3.5h4M6.5 7l1 12.5a1.5 1.5 0 001.5 1.4h6a1.5 1.5 0 001.5-1.4L17.5 7M10 11v6M14 11v6" />
  </svg>
);

export const CloseIcon = ({ size = 20, ...props }: IconProps) => (
  <svg {...base(size, props)}>
    <path d="M5 5l14 14M19 5L5 19" />
  </svg>
);

export const InfoIcon = ({ size = 22, ...props }: IconProps) => (
  <svg {...base(size, props)}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M12 7.5v5.5M12 16.2v.3" />
  </svg>
);

export const ClipboardCrossIcon = ({ size = 80, ...props }: IconProps) => (
  <svg {...base(size, { strokeWidth: 1.4, ...props })}>
    <rect x="4.5" y="4.5" width="15" height="17" rx="3.5" />
    <rect x="8.5" y="2.5" width="7" height="4" rx="1.5" />
    <path d="M9.5 11.5l5 5M14.5 11.5l-5 5" />
  </svg>
);

export const CheckBigIcon = ({ size = 80, ...props }: IconProps) => (
  <svg {...base(size, { strokeWidth: 1.4, ...props })}>
    <circle cx="12" cy="12" r="10" />
    <path d="M7.5 12.5l3 3 6-6.5" />
  </svg>
);
