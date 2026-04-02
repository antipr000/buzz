import axios from "axios";

const zippo = axios.create({
  baseURL: "https://api.zippopotam.us",
  timeout: 12_000,
});

type ZippoPlace = { "place name": string; state: string };
type ZippoBody = { country?: string; places?: ZippoPlace[] };

export type IndiaPincodeLookupOk = {
  ok: true;
  state: string;
  country: string;
  localityHint: string | null;
};

export type IndiaPincodeLookupFail = {
  ok: false;
  error: "invalid_format" | "not_found" | "network";
};

export type IndiaPincodeLookupResult = IndiaPincodeLookupOk | IndiaPincodeLookupFail;

/** Strip non-digits and cap at 6 — use on raw keyboard/paste only (e.g. form `onChange`). */
export function normalizeIndiaPinInput(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 6);
}

export function isCompleteIndiaPin(digits: string): boolean {
  return /^\d{6}$/.test(digits);
}

/** Expects exactly 6 digits (caller should normalize raw input once, e.g. in the form). */
export async function lookupIndiaPincode(
  pinDigits: string
): Promise<IndiaPincodeLookupResult> {
  if (!isCompleteIndiaPin(pinDigits)) {
    return { ok: false, error: "invalid_format" };
  }

  try {
    const { data } = await zippo.get<ZippoBody>(`/IN/${pinDigits}`);
    const place = data.places?.[0];
    if (!place) return { ok: false, error: "not_found" };

    return {
      ok: true,
      state: place.state,
      country: data.country ?? "India",
      localityHint: place["place name"] ?? null,
    };
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      return { ok: false, error: "not_found" };
    }
    return { ok: false, error: "network" };
  }
}
