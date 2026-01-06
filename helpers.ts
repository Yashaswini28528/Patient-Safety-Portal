import { Address, HealthType } from "../components/CreatePatient/types";

export const formatDateForInput = (dateString: string): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

export const detectHealthType = (healthType: string | null): HealthType => {
  if (!healthType) return "Maternity";

  const type = healthType.toLowerCase();
  if (type.includes("maternity") || type.includes("pregnancy"))
    return "Maternity";
  if (type.includes("diabetic") || type.includes("diabetes")) return "Diabetic";
  if (type.includes("cardiac") || type.includes("heart")) return "Cardiac";

  return "Maternity";
};

export const mapAddressFields = (addressData: any): Address => ({
  homeFlatNo:
    addressData.homeFlatNo ||
    addressData.homeFlatNumber ||
    addressData.flatNo ||
    "",
  streetNo:
    addressData.streetNo ||
    addressData.streetNumber ||
    addressData.street ||
    "",
  town: addressData.town || addressData.city || addressData.townCity || "",
  fullAddress:
    addressData.fullAddress ||
    addressData.address ||
    addressData.completeAddress ||
    "",
});

export const validateRequiredField = (
  value: any,
  fieldName: string
): string => {
  if (!value || String(value).trim() === "") {
    return `${fieldName} is required`;
  }
  return "";
};

export const validateNumberField = (
  value: number,
  fieldName: string
): string => {
  if (!value || value <= 0) {
    return `Valid ${fieldName} is required`;
  }
  return "";
};

export const getAuthToken = (): string => {
  const token = sessionStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");
  return token;
};
