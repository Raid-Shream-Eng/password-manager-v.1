import type { VaultItemPayloadV1 } from "@password-manager/shared-types";

/**
 * Only password-affecting identity fields go into this key, so displayName and
 * notes edits can save without triggering the password-change warning.
 */
export function buildGenerationIdentityKey(
  payload: Pick<
    VaultItemPayloadV1,
    "site" | "usernameOrEmail" | "passwordProfile"
  >,
): string {
  const siteKey =
    payload.site.kind === "domain"
      ? `domain:${payload.site.normalizedDomain}`
      : `label:${payload.site.generationLabel}`;

  return JSON.stringify({
    site: siteKey,
    usernameOrEmail: payload.usernameOrEmail.trim().toLowerCase(),
    passwordProfile: payload.passwordProfile,
  });
}
