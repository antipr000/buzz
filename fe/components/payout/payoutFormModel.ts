import { Alert } from "react-native";
import type {
  PayoutAccountTypeApi,
  PayoutCreatePayload,
  PayoutOut,
  PayoutPatchPayload,
} from "@/services/types/payout";

/** Matches `be/payouts/services/payout_service.py` — IFSC and digit rules. */
export const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const ACCOUNT_DIGITS_RE = /^\d{6,18}$/;

export const PAYOUT_ACCOUNT_TYPES_UI: { label: string; value: PayoutAccountTypeApi }[] = [
  { label: "Savings", value: "SAVINGS" },
  { label: "Current", value: "CURRENT" },
];

export type PayoutFormState = {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  accountType: PayoutAccountTypeApi;
  setAsPrimary: boolean;
};

export function emptyPayoutForm(): PayoutFormState {
  return {
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    accountType: "SAVINGS",
    setAsPrimary: true,
  };
}

/** Strip to digits only (same idea as backend). */
function onlyAccountDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export type PayoutFormBuildResult =
  | { ok: true; payload: PayoutCreatePayload }
  | { ok: false; alertTitle: string; alertMessage: string };

export function evaluatePayoutForm(form: PayoutFormState): PayoutFormBuildResult {
  const holder = form.accountHolderName.trim();
  if (!holder) {
    return {
      ok: false,
      alertTitle: "Missing field",
      alertMessage: "Please enter the account holder name.",
    };
  }

  const acct = onlyAccountDigits(form.accountNumber);
  if (!ACCOUNT_DIGITS_RE.test(acct)) {
    return {
      ok: false,
      alertTitle: "Invalid account number",
      alertMessage: "Account number must be 6–18 digits.",
    };
  }

  const confirm = onlyAccountDigits(form.confirmAccountNumber);
  if (acct !== confirm) {
    return {
      ok: false,
      alertTitle: "Mismatch",
      alertMessage: "Account number and confirmation must match.",
    };
  }

  const ifsc = form.ifscCode.trim().toUpperCase();
  if (!IFSC_RE.test(ifsc)) {
    return {
      ok: false,
      alertTitle: "Invalid IFSC",
      alertMessage: "IFSC must be 11 characters: 4 letters, 0, then 6 alphanumeric.",
    };
  }

  const bank = form.bankName.trim();
  const payload: PayoutCreatePayload = {
    account_holder_name: holder,
    account_number: acct,
    ifsc_code: ifsc,
    account_type: form.accountType,
    bank_name: bank ? bank : null,
    is_primary: form.setAsPrimary,
  };

  return { ok: true, payload };
}

export function buildValidatedPayload(form: PayoutFormState): PayoutCreatePayload | null {
  const r = evaluatePayoutForm(form);
  if (!r.ok) {
    Alert.alert(r.alertTitle, r.alertMessage);
    return null;
  }
  return r.payload;
}

/** Hydrate edit form — API never returns full account number (only last4). */
export function formStateFromPayoutOut(row: PayoutOut): PayoutFormState {
  return {
    accountHolderName: row.account_holder_name,
    bankName: row.bank_name ?? "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: row.ifsc_code,
    accountType: row.account_type,
    setAsPrimary: row.is_primary,
  };
}

export type PayoutPatchBuildResult =
  | { ok: true; payload: PayoutPatchPayload }
  | { ok: false; alertTitle: string; alertMessage: string };

/**
 * PATCH payload: same field rules as create, except account number is optional —
 * leave both blank to keep the existing account (API stores full number server-side).
 */
export function evaluatePayoutPatchForm(form: PayoutFormState): PayoutPatchBuildResult {
  const holder = form.accountHolderName.trim();
  if (!holder) {
    return {
      ok: false,
      alertTitle: "Missing field",
      alertMessage: "Please enter the account holder name.",
    };
  }

  const acct = onlyAccountDigits(form.accountNumber);
  const confirm = onlyAccountDigits(form.confirmAccountNumber);

  let account_number: string | undefined;
  if (acct === "" && confirm === "") {
    account_number = undefined;
  } else if (acct !== "" && confirm !== "") {
    if (acct !== confirm) {
      return {
        ok: false,
        alertTitle: "Mismatch",
        alertMessage: "Account number and confirmation must match.",
      };
    }
    if (!ACCOUNT_DIGITS_RE.test(acct)) {
      return {
        ok: false,
        alertTitle: "Invalid account number",
        alertMessage: "Account number must be 6–18 digits.",
      };
    }
    account_number = acct;
  } else {
    return {
      ok: false,
      alertTitle: "Account number",
      alertMessage:
        "Enter both account fields to change the number, or leave both empty to keep the current account.",
    };
  }

  const ifsc = form.ifscCode.trim().toUpperCase();
  if (!IFSC_RE.test(ifsc)) {
    return {
      ok: false,
      alertTitle: "Invalid IFSC",
      alertMessage: "IFSC must be 11 characters: 4 letters, 0, then 6 alphanumeric.",
    };
  }

  const bank = form.bankName.trim();
  const payload: PayoutPatchPayload = {
    account_holder_name: holder,
    ifsc_code: ifsc,
    account_type: form.accountType,
    bank_name: bank ? bank : null,
    is_primary: form.setAsPrimary,
  };
  if (account_number !== undefined) {
    payload.account_number = account_number;
  }

  return { ok: true, payload };
}

export function buildValidatedPayoutPatchPayload(form: PayoutFormState): PayoutPatchPayload | null {
  const r = evaluatePayoutPatchForm(form);
  if (!r.ok) {
    Alert.alert(r.alertTitle, r.alertMessage);
    return null;
  }
  return r.payload;
}
