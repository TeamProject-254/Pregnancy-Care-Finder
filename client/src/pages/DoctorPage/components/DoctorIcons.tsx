import type { ImgHTMLAttributes } from "react";
import backIcon from "../../../assets/img/icon-back.svg";
import workGrayIcon from "../../../assets/img/icon-work-gray.svg";
import geoGrayIcon from "../../../assets/img/icon-geo-gray.svg";
import languageGrayIcon from "../../../assets/img/icon-language-gray.svg";
import earthGrayIcon from "../../../assets/img/icon-earth-gray.svg";
import work16Icon from "../../../assets/img/icon-work-16.svg";
import calendar16Icon from "../../../assets/img/icon-calendar-16.svg";
import geo16Icon from "../../../assets/img/icon-geo-16.svg";
import time16Icon from "../../../assets/img/icon-time-16.svg";
import card16Icon from "../../../assets/img/icon-card-16.svg";

type IconProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & { size?: number };

const createIcon = (src: string, defaultSize: number) => {
  const Icon = ({ size = defaultSize, alt = "", ...props }: IconProps) => (
    <img src={src} width={size} height={size} alt={alt} aria-hidden={alt ? undefined : true} {...props} />
  );
  return Icon;
};

export const BackIcon = createIcon(backIcon, 16);
export const BriefcaseIcon = createIcon(workGrayIcon, 24);
export const PinIcon = createIcon(geoGrayIcon, 24);
export const GlobeIcon = createIcon(languageGrayIcon, 24);
export const EarthIcon = createIcon(earthGrayIcon, 32);
export const ServiceIcon = createIcon(work16Icon, 16);
export const CalendarSmallIcon = createIcon(calendar16Icon, 16);
export const PinSmallIcon = createIcon(geo16Icon, 16);
export const ClockSmallIcon = createIcon(time16Icon, 16);
export const WalletIcon = createIcon(card16Icon, 16);
