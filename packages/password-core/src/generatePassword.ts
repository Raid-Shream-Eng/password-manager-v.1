import {
  MAX_GENERATION_ATTEMPTS,
  type PasswordGenerationInputV1,
  type Result,
} from "@password-manager/shared-types";
import { canonicalizeJson } from "./canonicalize";
import { mapBytesToPassword } from "./mapBytesToPassword";
import { validatePasswordProfile } from "./validatePasswordProfile";

export type PasswordCoreCryptoProvider = {
  hmacSha256(key: Uint8Array, message: Uint8Array): Promise<Uint8Array>;
};

export async function generatePassword(params: {
  input: PasswordGenerationInputV1;
  passwordGenerationKey: Uint8Array;
  crypto: PasswordCoreCryptoProvider;
}): Promise<Result<string>> {
  const { input, passwordGenerationKey, crypto } = params;

  const profileResult = validatePasswordProfile(input.passwordProfile);

  if (!profileResult.ok) {
    return profileResult;
  }

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    const canonicalResult = canonicalizeJson({
      input,
      attempt,
    });

    if (!canonicalResult.ok) {
      return canonicalResult;
    }

    const message = new TextEncoder().encode(canonicalResult.value);
    const digest = await crypto.hmacSha256(passwordGenerationKey, message);

    const candidate = mapBytesToPassword({
      bytes: digest,
      profile: profileResult.value,
    });

    if (candidate.ok) {
      return candidate;
    }
  }

  return {
    ok: false,
    error: {
      code: "PASSWORD_GENERATION_FAILED",
      message: "Could not generate a password satisfying the selected rules.",
    },
  };
}
