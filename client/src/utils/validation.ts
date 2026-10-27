import { isAxiosError } from "axios";

const PASSWORD_SPECIAL_CHARACTERS = "@#$%^&+=!";

export const validateEmail = (rawValue: string): true | string => {
  const value = rawValue.trim();
  if (!value) return "Enter your email address.";
  if (/\s/.test(value)) return "Email address cannot contain spaces.";

  const atCount = value.split("@").length - 1;
  if (atCount === 0) return "Email address must contain the @ symbol.";
  if (atCount > 1) return "Email address can contain only one @ symbol.";

  const [localPart, domain] = value.split("@");
  if (!localPart) return "Enter the part of the email before @.";
  if (!/^[A-Za-z0-9._%+-]+$/.test(localPart)) {
    return "The part before @ can contain only letters, digits and . _ % + -";
  }
  if (localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..")) {
    return "The part before @ cannot start or end with a dot or contain two dots in a row.";
  }
  if (!domain) return "Enter the domain after @, for example gmail.com.";
  if (!domain.includes(".")) return "The domain must contain a dot, for example gmail.com.";

  const labels = domain.split(".");
  if (labels.some((label) => !label)) return "The domain cannot start or end with a dot or contain two dots in a row.";
  if (labels.some((label) => !/^[A-Za-z0-9-]+$/.test(label) || label.startsWith("-") || label.endsWith("-"))) {
    return "The domain can contain only letters, digits and hyphens.";
  }
  if (!/^[A-Za-z]{2,}$/.test(labels[labels.length - 1])) {
    return "The domain ending must be at least 2 letters, for example .com or .ua.";
  }
  return true;
};

export const newPasswordValidators = {
  required: (value: string) => value.length > 0 || "Create a password.",
  minLength: (value: string) => value.length >= 8 || `Password must be at least 8 characters long (now ${value.length}).`,
  noSpaces: (value: string) => !/\s/.test(value) || "Password cannot contain spaces.",
  lowercase: (value: string) => /[a-z]/.test(value) || "Add at least one lowercase letter (a-z).",
  uppercase: (value: string) => /[A-Z]/.test(value) || "Add at least one uppercase letter (A-Z).",
  digit: (value: string) => /[0-9]/.test(value) || "Add at least one digit (0-9).",
  special: (value: string) =>
    [...PASSWORD_SPECIAL_CHARACTERS].some((character) => value.includes(character)) ||
    `Add at least one special character: ${PASSWORD_SPECIAL_CHARACTERS.split("").join(" ")}`,
};

export const validatePersonName = (fieldName: string) => (rawValue: string): true | string => {
  const value = (rawValue ?? "").trim();
  if (!value) return `Enter your ${fieldName}.`;
  if (value.length < 2) return `${capitalize(fieldName)} must be at least 2 characters long.`;
  if (value.length > 50) return `${capitalize(fieldName)} must be at most 50 characters long.`;
  if (!/^[\p{L}][\p{L}' -]*$/u.test(value)) {
    return `${capitalize(fieldName)} can contain only letters, spaces, apostrophes and hyphens.`;
  }
  return true;
};

export const validateYearsOfExperience = (rawValue: string | number): true | string => {
  const text = String(rawValue ?? "").trim();
  if (text === "" || text === "NaN") return "Enter your years of experience.";
  const value = Number(text);
  if (!Number.isFinite(value)) return "Years of experience must be a number.";
  if (!Number.isInteger(value)) return "Enter whole years, without decimals.";
  if (value < 0) return "Years of experience cannot be negative.";
  if (value > 70) return "Years of experience cannot be more than 70.";
  return true;
};

export const validatePhone = (rawValue: string): true | string => {
  const value = (rawValue ?? "").trim();
  if (!value) return "Enter your contact phone number.";
  if (!/^\+?[\d\s()-]+$/.test(value)) return "Phone number can contain only digits, spaces, brackets, hyphens and a leading +.";
  const digits = value.replace(/\D/g, "").length;
  if (digits < 10) return `Phone number is too short: ${digits} digits, at least 10 needed.`;
  if (digits > 15) return `Phone number is too long: ${digits} digits, at most 15 allowed.`;
  return true;
};

export const validateAddress = (rawValue: string): true | string => {
  const value = (rawValue ?? "").trim();
  if (!value) return "Enter the city and address where you consult.";
  if (value.length < 3) return "Address is too short. Add at least the city name.";
  return true;
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

interface ApiErrorBody {
  message?: string;
  error?: string;
  validationErrors?: Record<string, string>;
}

export const apiErrorMessage = (
  error: unknown,
  fallback: string,
  byStatus: Partial<Record<number, string>> = {},
): string => {
  if (!isAxiosError(error)) return fallback;
  if (!error.response) return "Unable to reach the server. Check your internet connection and try again.";

  const status = error.response.status;
  if (byStatus[status]) return byStatus[status] as string;

  const data = error.response.data as ApiErrorBody | undefined;
  const validation = data?.validationErrors ? Object.values(data.validationErrors).join(" ") : "";
  if (validation) return validation;
  if (status === 429) return data?.error || "Too many attempts. Please wait a moment and try again.";
  if (status >= 500) return "The server is temporarily unavailable. Please try again in a minute.";
  return data?.message || data?.error || fallback;
};
