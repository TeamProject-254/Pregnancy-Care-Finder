export type FilterInputType = "checkbox" | "radio";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FiltersState {
  services: string[];
  procedures: string[];
  availability: string;
  languages: string[];
}

export type FilterSectionKey = keyof FiltersState;

interface BaseAccordionProps {
  title: string;
  options: FilterOption[];
  defaultOpen?: boolean;
}

export interface RadioAccordionProps extends BaseAccordionProps {
  type: "radio";
  selected: string;
  onChange: (value: string) => void;
}

export interface CheckboxAccordionProps extends BaseAccordionProps {
  type: "checkbox";
  selected: string[];
  onChange: (value: string[]) => void;
}

export type FilterAccordionProps = RadioAccordionProps | CheckboxAccordionProps;


export interface ProviderSearchParams {
  specializations?: string[];
  location?: string;
  services?: string[];
  languages?: string[];
  availabilityDateFrom?: string; 
  availabilityDateTo?: string;  
}

export interface ProviderSummaryResponse {
  id: number;
  firstName: string;
  lastName: string;
  professionalRole: string;
  yearsOfExperience: number;
  address: string;
  specialization: string;
  languages: string[];
  photoUrl: string;
  published: boolean;
}