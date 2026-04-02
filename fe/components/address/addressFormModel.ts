import { Alert } from "react-native";
import type { PincodeLookupState } from "@/hooks/useIndiaPincodeLookup";
import type { AddressCreatePayload, AddressOut } from "@/services/types/address";

export const ADDRESS_TYPES_UI = ["Home", "Work", "Other"] as const;
export type UiAddressType = (typeof ADDRESS_TYPES_UI)[number];

export type AddressFormState = {
  addressType: UiAddressType;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  pinCode: string;
  city: string;
  state: string;
  country: string;
};

export function emptyAddressForm(): AddressFormState {
  return {
    addressType: "Home",
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    pinCode: "",
    city: "",
    state: "",
    country: "India",
  };
}

export function isUiAddressType(s: string): s is UiAddressType {
  return (ADDRESS_TYPES_UI as readonly string[]).includes(s);
}

/** Map a saved address row into form state (edit screen). */
export function formStateFromAddressOut(row: AddressOut): AddressFormState {
  const t = row.address_type;
  return {
    ...emptyAddressForm(),
    addressType: isUiAddressType(t) ? t : "Other",
    firstName: row.first_name,
    lastName: row.last_name,
    mobile: row.mobile_number,
    email: row.email_id,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2 ?? "",
    landmark: row.landmark ?? "",
    pinCode: String(row.pin_code),
    city: row.city,
    state: row.state,
    country: row.country,
  };
}

function parsePinCode(pin: string): number | null {
  if (!/^\d{6}$/.test(pin)) return null;
  const n = parseInt(pin, 10);
  if (n < 100_000 || n > 999_999) return null;
  return n;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates `form`, shows `Alert` for the first problem, and returns an API payload or `null`.
 */
export function buildValidatedPayload(form: AddressFormState): AddressCreatePayload | null {
  const {
    pinCode: pinStr,
    firstName,
    lastName,
    mobile,
    email,
    addressLine1,
    addressLine2,
    landmark,
    city,
    state,
    country,
    addressType,
  } = form;

  const pinNum = parsePinCode(pinStr);
  if (!firstName.trim()) {
    Alert.alert("Missing field", "Please enter first name.");
    return null;
  }
  if (!lastName.trim()) {
    Alert.alert("Missing field", "Please enter last name.");
    return null;
  }
  if (!mobile.trim()) {
    Alert.alert("Missing field", "Please enter mobile number.");
    return null;
  }
  const em = email.trim();
  if (!em || !EMAIL_RE.test(em)) {
    Alert.alert("Invalid email", "Please enter a valid email address.");
    return null;
  }
  if (!addressLine1.trim()) {
    Alert.alert("Missing field", "Please enter address line 1.");
    return null;
  }
  if (pinNum === null) {
    Alert.alert("Invalid PIN", "Please enter a valid 6-digit PIN code.");
    return null;
  }
  if (!city.trim() || !state.trim() || !country.trim()) {
    Alert.alert("Missing field", "Please enter city, state, or country.");
    return null;
  }

  const line2 = addressLine2.trim();
  const lm = landmark.trim();
  return {
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    mobile_number: mobile.trim(),
    email_id: em,
    pin_code: pinNum,
    address_line1: addressLine1.trim(),
    address_line2: line2 ? line2 : null,
    landmark: lm ? lm : null,
    city: city.trim(),
    state: state.trim(),
    country: country.trim(),
    address_type: addressType.toLowerCase(),
  };
}

export function pinLookupHint(lookup: PincodeLookupState): string | null {
  if (lookup.status === "loading") return "Looking up PIN…";
  if (lookup.status === "error") {
    if (lookup.error === "not_found") return "PIN not found — check or enter city/state manually";
    if (lookup.error === "network") return "Could not reach PIN directory — check connection";
  }
  return null;
}
