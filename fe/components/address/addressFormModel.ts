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

export type AddressFormBuildResult =
  | { ok: true; payload: AddressCreatePayload }
  | { ok: false; alertTitle: string; alertMessage: string };

/**
 * Validates `form` without showing UI — use for enabling buttons, etc.
 */
export function evaluateAddressForm(form: AddressFormState): AddressFormBuildResult {
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
    return { ok: false, alertTitle: "Missing field", alertMessage: "Please enter first name." };
  }
  if (!lastName.trim()) {
    return { ok: false, alertTitle: "Missing field", alertMessage: "Please enter last name." };
  }
  if (!mobile.trim()) {
    return { ok: false, alertTitle: "Missing field", alertMessage: "Please enter mobile number." };
  }
  const em = email.trim();
  if (!em || !EMAIL_RE.test(em)) {
    return {
      ok: false,
      alertTitle: "Invalid email",
      alertMessage: "Please enter a valid email address.",
    };
  }
  if (!addressLine1.trim()) {
    return { ok: false, alertTitle: "Missing field", alertMessage: "Please enter address line 1." };
  }
  if (pinNum === null) {
    return {
      ok: false,
      alertTitle: "Invalid PIN",
      alertMessage: "Please enter a valid 6-digit PIN code.",
    };
  }
  if (!city.trim() || !state.trim() || !country.trim()) {
    return {
      ok: false,
      alertTitle: "Missing field",
      alertMessage: "Please enter city, state, or country.",
    };
  }

  const line2 = addressLine2.trim();
  const lm = landmark.trim();
  return {
    ok: true,
    payload: {
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
    },
  };
}

export function addressFormSatisfiesPurchase(form: AddressFormState): boolean {
  return evaluateAddressForm(form).ok;
}

/**
 * Validates `form`, shows `Alert` for the first problem, and returns an API payload or `null`.
 */
export function buildValidatedPayload(form: AddressFormState): AddressCreatePayload | null {
  const r = evaluateAddressForm(form);
  if (!r.ok) {
    Alert.alert(r.alertTitle, r.alertMessage);
    return null;
  }
  return r.payload;
}

export function pinLookupHint(lookup: PincodeLookupState): string | null {
  if (lookup.status === "loading") return "Looking up PIN…";
  if (lookup.status === "error") {
    if (lookup.error === "not_found") return "PIN not found — check or enter city/state manually";
    if (lookup.error === "network") return "Could not reach PIN directory — check connection";
  }
  return null;
}
