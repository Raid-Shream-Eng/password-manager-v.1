import type { PasswordProfile } from "./passwordProfile";
import type { SiteIdentifier } from "./siteIdentifier";

export type PasswordVersionHistoryItem = {
    passwordVersion: number;
    passwordProfileSnapshot: PasswordProfile;
    changedAt: string;
    reason: "rotation" | "site-policy-change" | "manual";
};

export type VaultItemPayload = {
    schemaVersion: 1;
    site: SiteIdentifier;
    usernameOrEmail: string;
    passwordProfile: PasswordProfile;
    passwordHistory: PasswordVersionHistoryItem[];
    notes?: string;
    lastUsedAt?: string;
    createdAt: string;
    updatedAt: string;
};
