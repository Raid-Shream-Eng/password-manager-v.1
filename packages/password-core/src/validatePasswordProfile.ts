import {
  passwordProfileV1Schema,
  type PasswordProfileV1,
  type Result,
} from "@password-manager/shared-types";

export function validatePasswordProfile(
  profile: PasswordProfileV1,
): Result<PasswordProfileV1> {
  const parsed = passwordProfileV1Schema.safeParse(profile);

  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: "INVALID_PASSWORD_PROFILE",
        message: parsed.error.issues[0]?.message ?? "Invalid password profile.",
        cause: parsed.error,
      },
    };
  }

  return {
    ok: true,
    value: parsed.data,
  };
}
