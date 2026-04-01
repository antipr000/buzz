import { formatLocalDateString } from '@/app/(main)/create-event/payload';
import type {
  MaritalStatus,
  ProfileIdentify,
  ProfileMeResponse,
  ProfilePatchPayload,
} from '@/services/types/profile';

export function splitFullName(full: string): { first: string; last: string } {
  const t = full.trim();
  const i = t.indexOf(' ');
  if (i === -1) return { first: t, last: '' };
  return { first: t.slice(0, i), last: t.slice(i + 1).trim() };
}

export function buildJoinedFullName(first: string, last: string): string {
  const f = first.trim();
  const l = last.trim();
  if (f && l) return `${f} ${l}`;
  return f || l;
}

/** Parse `YYYY-MM-DD` at local noon to reduce timezone boundary issues. */
export function parseBirthdayDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map((x) => Number.parseInt(x, 10));
  return new Date(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0, 0);
}

export function buildProfilePatch(
  initial: ProfileMeResponse,
  current: {
    firstName: string;
    lastName: string;
    birthdayCleared: boolean;
    birthdayDate: Date;
    identify: ProfileIdentify | null;
    maritalStatus: MaritalStatus | null;
    mobileNumber: string;
  }
): ProfilePatchPayload {
  const patch: ProfilePatchPayload = {};

  const joined = buildJoinedFullName(current.firstName, current.lastName);
  if (joined !== initial.full_name.trim()) {
    patch.full_name = joined;
  }

  const nextBirthday: string | null = current.birthdayCleared
    ? null
    : formatLocalDateString(current.birthdayDate);
  const prevBirthday = initial.birthday;
  if (nextBirthday !== prevBirthday) {
    patch.birthday = nextBirthday;
  }

  if (current.identify !== initial.identify) {
    patch.identify = current.identify;
  }

  if (current.maritalStatus !== initial.marital_status) {
    patch.marital_status = current.maritalStatus;
  }

  const mobile = current.mobileNumber.trim() || null;
  const prevMobile = initial.mobile_number?.trim() || null;
  if (mobile !== prevMobile) {
    patch.mobile_number = mobile;
  }

  return patch;
}
