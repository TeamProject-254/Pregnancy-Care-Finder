import React from "react";

interface CheckIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const CheckIcon: React.FC<CheckIconProps> = ({
  size = 18,
  className = "",
  ...rest
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...rest}
    >
      <path
        d="M16.6667 0.666748L6.00008 16.6667L0.666748 8.66675"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
