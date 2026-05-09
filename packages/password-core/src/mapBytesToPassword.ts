import type {
  PasswordProfileV1,
  Result,
} from "@password-manager/shared-types";
import {
  AMBIGUOUS_CHARACTERS,
  LOWERCASE,
  NUMBERS,
  UPPERCASE,
} from "./characterSets";

export function mapBytesToPassword(params: {
  bytes: Uint8Array;
  profile: PasswordProfileV1;
}): Result<string> {
  const { bytes, profile } = params;

  const characterPool = buildCharacterPool(profile);

  if (!characterPool.ok) {
    return characterPool;
  }

  if (bytes.length < profile.length) {
    return {
      ok: false,
      error: {
        code: "INSUFFICIENT_RANDOM_BYTES",
        message: "Not enough bytes to map password.",
      },
    };
  }

  let password = "";

  for (let i = 0; i < profile.length; i++) {
    const byte = bytes[i];

    if (byte === undefined) {
      return {
        ok: false,
        error: {
          code: "INSUFFICIENT_RANDOM_BYTES",
          message: "Not enough bytes to map password.",
        },
      };
    }

    const index = byte % characterPool.value.length;
    password += characterPool.value[index]!;
  }

  if (!satisfiesRequiredClasses(password, profile)) {
    return {
      ok: false,
      error: {
        code: "PASSWORD_DOES_NOT_SATISFY_RULES",
        message: "Generated candidate does not satisfy password rules.",
      },
    };
  }

  if (profile.requiredStartWithLetter && !/^[a-zA-Z]/.test(password)) {
    return {
      ok: false,
      error: {
        code: "PASSWORD_DOES_NOT_SATISFY_RULES",
        message: "Generated candidate does not start with a letter.",
      },
    };
  }

  return {
    ok: true,
    value: password,
  };
}

function buildCharacterPool(profile: PasswordProfileV1): Result<string> {
  let pool = "";

  if (profile.includeLowercase) {
    pool += LOWERCASE;
  }

  if (profile.includeUppercase) {
    pool += UPPERCASE;
  }

  if (profile.includeNumbers) {
    pool += NUMBERS;
  }

  if (profile.includeSymbols) {
    pool += profile.allowedSymbols;
  }

  if (profile.avoidAmbiguousCharacters) {
    pool = [...pool]
      .filter((char) => !AMBIGUOUS_CHARACTERS.has(char))
      .join("");
  }

  if (!pool) {
    return {
      ok: false,
      error: {
        code: "INVALID_PASSWORD_PROFILE",
        message: "Character pool is empty.",
      },
    };
  }

  return {
    ok: true,
    value: pool,
  };
}

function satisfiesRequiredClasses(
  password: string,
  profile: PasswordProfileV1,
): boolean {
  if (profile.includeLowercase && !/[a-z]/.test(password)) {
    return false;
  }

  if (profile.includeUppercase && !/[A-Z]/.test(password)) {
    return false;
  }

  if (profile.includeNumbers && !/[0-9]/.test(password)) {
    return false;
  }

  if (profile.includeSymbols) {
    const symbols = new Set([...profile.allowedSymbols]);
    const hasSymbol = [...password].some((char) => symbols.has(char));

    if (!hasSymbol) {
      return false;
    }
  }

  return true;
}
