import React from "react";
import eyeIcon from "../../assets/img/eye.svg";

interface EyeIconProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  size?: number;
}

export const EyeIcon: React.FC<EyeIconProps> = ({ width = 34, height = 28, className = "", alt = "", ...rest }) => (
  <img src={eyeIcon} width={width} height={height} className={className} alt={alt} aria-hidden={alt ? undefined : true} {...rest} />
);
