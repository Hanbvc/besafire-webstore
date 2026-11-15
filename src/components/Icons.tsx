import type { ReactNode, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconMenu = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 6.5h18M3 12h18M3 17.5h18" />
  </Icon>
);

export const IconBag = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5.5 8h13A1.5 1.5 0 0 1 20 9.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9.5A1.5 1.5 0 0 1 5.5 8z" />
    <path d="M8.5 8V6.5a3.5 3.5 0 0 1 7 0V8" />
  </Icon>
);

export const IconBagPlus = (p: IconProps) => (
  <Icon {...p}>
    <path d="M11.5 20H6a2 2 0 0 1-2-2V9h13.5v3.5" />
    <path d="M7.5 9V7.5a3.25 3.25 0 0 1 6.5 0V9" />
    <path d="M17.5 15.5v5.5M14.75 18.25h5.5" />
  </Icon>
);

export const IconHeart = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <Icon {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20.3s-7.8-4.5-7.8-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.8 2.5c0 5.7-7.8 10.2-7.8 10.2z" />
  </Icon>
);

export const IconFilter = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="6.5" cy="7" r="2.3" />
    <path d="M8.8 7H21" />
    <circle cx="17.5" cy="17" r="2.3" />
    <path d="M3 17h12.2" />
  </Icon>
);

export const IconChevronDown = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 9l7 7 7-7" />
  </Icon>
);

export const IconChevronUp = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 15l7-7 7 7" />
  </Icon>
);

export const IconChevronRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 5l7 7-7 7" />
  </Icon>
);

export const IconClose = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 5l14 14M19 5L5 19" />
  </Icon>
);

export const IconSearch = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  </Icon>
);

export const IconMinus = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 12h12" />
  </Icon>
);

export const IconPlus = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 6v12M6 12h12" />
  </Icon>
);

export const IconWhatsApp = (p: IconProps) => (
  <Icon {...p} strokeWidth="1.6">
    <path d="M12 3a9 9 0 0 0-7.7 13.65L3 21l4.5-1.2A9 9 0 1 0 12 3z" />
    <path
      d="M9.1 7.9c-.5.3-.9 1-.8 1.8.3 1.7 2.7 4.5 5 5.3.8.3 1.6.1 2.1-.4l.5-.7-1.9-1.3-.8.6c-.8-.3-2-1.6-2.4-2.5l.7-.8-1.2-2-1.2 0z"
      fill="currentColor"
      stroke="none"
    />
  </Icon>
);
