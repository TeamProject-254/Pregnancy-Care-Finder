import React from "react";
import tickIcon from "../../assets/img/tick.svg";

interface CheckIconProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  size?: number;
}

export const CheckIcon: React.FC<CheckIconProps> = ({ size = 18, className = "", alt = "", ...rest }) => (
  <img src={tickIcon} width={size} height={size} className={className} alt={alt} aria-hidden={alt ? undefined : true} {...rest} />
);
