import type { ImgHTMLAttributes } from "react";
import searchIcon from "../../../assets/img/icon-search.svg";
import calendarIcon from "../../../assets/img/icon-calendar.svg";
import calendarAccentIcon from "../../../assets/img/icon-calendar-accent.svg";
import filterIcon from "../../../assets/img/icon-filter.svg";
import chevronDownIcon from "../../../assets/img/icon-chevron-down.svg";
import clockPrimaryIcon from "../../../assets/img/icon-clock-primary.svg";
import clockAccentIcon from "../../../assets/img/icon-clock-accent-16.svg";
import checkCircleSuccessIcon from "../../../assets/img/icon-check-circle-success.svg";
import trashIcon from "../../../assets/img/trash-icon.svg";
import closeIcon from "../../../assets/img/icon-close.svg";
import alertBlueIcon from "../../../assets/img/icon-alert-blue.svg";
import infoRedIcon from "../../../assets/img/icon-info-red.svg";
import clipboardCrossIcon from "../../../assets/img/icon-clipboard-cross.svg";
import checkCircleBigIcon from "../../../assets/img/icon-check-circle-big.svg";

type IconProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & { size?: number };

const createIcon = (src: string, defaultSize: number) => {
  const Icon = ({ size = defaultSize, alt = "", ...props }: IconProps) => (
    <img src={src} width={size} height={size} alt={alt} aria-hidden={alt ? undefined : true} {...props} />
  );
  return Icon;
};

export const SearchIcon = createIcon(searchIcon, 24);
export const CalendarIcon = createIcon(calendarIcon, 24);
export const TodayIcon = createIcon(calendarAccentIcon, 32);
export const FilterIcon = createIcon(filterIcon, 24);
export const ChevronDownIcon = createIcon(chevronDownIcon, 16);
export const ClockIcon = createIcon(clockPrimaryIcon, 32);
export const PendingClockIcon = createIcon(clockAccentIcon, 14);
export const CheckCircleIcon = createIcon(checkCircleSuccessIcon, 32);
export const TrashIcon = createIcon(trashIcon, 24);
export const CloseIcon = createIcon(closeIcon, 32);
export const InfoIcon = createIcon(alertBlueIcon, 32);
export const InfoRedIcon = createIcon(infoRedIcon, 44);
export const ClipboardCrossIcon = createIcon(clipboardCrossIcon, 120);
export const CheckBigIcon = createIcon(checkCircleBigIcon, 120);
