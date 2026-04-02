import { useEffect, useState } from "react";
import {
  isCompleteIndiaPin,
  lookupIndiaPincode,
  type IndiaPincodeLookupFail,
  type IndiaPincodeLookupOk,
} from "@/lib/pincode/indiaZippopotam";

export type PincodeLookupState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; data: IndiaPincodeLookupOk }
  | { status: "error"; error: IndiaPincodeLookupFail["error"] };

/**
 * Looks up a 6-digit India PIN via Zippopotam (`/IN/{pin}`) as soon as input is complete.
 * Ignores stale responses when `pinInput` changes before the request finishes.
 */
export function useIndiaPincodeLookup(pinInput: string): PincodeLookupState {
  const [state, setState] = useState<PincodeLookupState>({ status: "idle" });

  useEffect(() => {
    if (!isCompleteIndiaPin(pinInput)) {
      setState((s) => (s.status === "idle" ? s : { status: "idle" }));
      return;
    }

    let cancelled = false;

    (async () => {
      setState({ status: "loading" });
      const result = await lookupIndiaPincode(pinInput);
      if (cancelled) return;
      if (result.ok) {
        setState({ status: "ok", data: result });
      } else {
        setState({ status: "error", error: result.error });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pinInput]);

  return state;
}
