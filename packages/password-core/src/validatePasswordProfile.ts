import type { Result } from "@password-manager/shared-types";

export type PasswordProfileV1 = {
  length?: number;

  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;

  allowedSymbols?: string;

  passwordVersion?: number;

  avoidAmbiguousCharacters?: boolean;
  requiredStartWithLetter?: boolean;
};

export type ValidPasswordProfileV1 = {
  length: number;

  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;

  allowedSymbols: string;

  passwordVersion: number;

  avoidAmbiguousCharacters: boolean;
  requiredStartWithLetter: boolean;
};

export const defaultPasswordProfileV1: ValidPasswordProfileV1 = {
  length: 20,

  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,

  allowedSymbols: "!@#$%^&*_-+=?",

  passwordVersion: 1,

  avoidAmbiguousCharacters: false,
  requiredStartWithLetter: false,
};

export type PasswordProfile = PasswordProfileV1;
export type ValidPasswordProfile = ValidPasswordProfileV1;

export function validatePasswordProfile(
  profile: PasswordProfileV1,
): Result<ValidPasswordProfileV1> {
  const normalized: ValidPasswordProfileV1 = {
    ...defaultPasswordProfileV1,
    ...profile,
  };

  if (
    !Number.isInteger(normalized.length) ||
    normalized.length < 12 ||
    normalized.length > 128
  ) {
    return {
      ok: false,
      error: {
        code: "INVALID_PASSWORD_PROFILE",
        message: "Password length must be an integer between 12 and 128.",
      },
    };
  }

  if (
    !Number.isInteger(normalized.passwordVersion) ||
    normalized.passwordVersion < 1
  ) {
    return {
      ok: false,
      error: {
        code: "INVALID_PASSWORD_PROFILE",
        message: "Password version must be a positive integer.",
      },
    };
  }

  const enabledCount = [
    normalized.includeUppercase,
    normalized.includeLowercase,
    normalized.includeNumbers,
    normalized.includeSymbols,
  ].filter(Boolean).length;

  const hasLetterClass = normalized.includeUppercase || normalized.includeLowercase;
  if (normalized.requiredStartWithLetter && !hasLetterClass) {
    return {
      ok: false,
      error: {
        code: "INVALID_PASSWORD_PROFILE",
        message: "At least one of uppercase or lowercase letters must be included when requiredStartWithLetter is true.",
      },
    };}
  if (enabledCount === 0) {
    return {
      ok: false,
      error: {
        code: "INVALID_PASSWORD_PROFILE",
        message: "At least one character type must be included.",
      },
    };
  }

  if (normalized.includeSymbols && normalized.allowedSymbols.length === 0) {
    return {
      ok: false,
      error: {
        code: "INVALID_PASSWORD_PROFILE",
        message: "Allowed symbols cannot be empty when symbols are enabled.",
      },
    };
  }

  if (normalized.length < enabledCount) {
    return {
      ok: false,
      error: {
        code: "INVALID_PASSWORD_PROFILE",
        message:
          "Password length is too short for the enabled character types.",
      },
    };
  }

  return {
    ok: true,
    value: normalized,
  };
}
