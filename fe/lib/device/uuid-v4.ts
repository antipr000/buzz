import { getRandomValues } from "expo-crypto";
import { v4 as uuidv4 } from "uuid";

/**
 * RFC4122 v4 UUID using `expo-crypto` for random bytes and `uuid` for formatting.
 * Works on Expo native + web without relying on Hermes `crypto.randomUUID`.
 * @see https://bjoernf.com/blog/uuid-v4-expo
 */
export function uuidV4(): string {
  const random = new Uint8Array(16);
  getRandomValues(random);
  return uuidv4({ random });
}
