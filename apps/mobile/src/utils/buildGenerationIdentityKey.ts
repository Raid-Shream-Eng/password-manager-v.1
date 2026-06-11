import type { VaultItemPayloadV1 } from "@password-manager/shared-types";

export function buildGenerationIdentityKey(payload: Pick<VaultItemPayloadV1, "site" | "usernameOrEmail"| "passwordProfile">): string {
    const siteKey = payload.site.kind === "domain" 
    ? `domain:${payload.site.normalizedDomain}`
    : `url:${payload.site.generationLabel}`;
     return JSON.stringify({
        site: siteKey,
        usernameOrEmail: payload.usernameOrEmail.trim().toLowerCase(),
        passwordProfile: payload.passwordProfile,
    });
}