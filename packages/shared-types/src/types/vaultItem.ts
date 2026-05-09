import type { PasswordProfileV1 } from "./passwordProfile";
import type { SiteIdentifier } from "./siteIdentifier";

export type PasswordVersionHistoryItemV1 = {
    passwordVersion: number;
    passwordProfileSnapshot: PasswordProfileV1;
    changedAt: string;
    reason: "rotation" | "site-policy-change" | "manual";
};

export type VaultItemPayloadV1 = {
    schemaVersion: 1;
    site: SiteIdentifier;
    usernameOrEmail: string;
    passwordProfile: PasswordProfileV1;
    passwordHistory: PasswordVersionHistoryItemV1[];
    notes?: string;
    lastUsedAt?: string;
    createdAt: string;
    updatedAt: string;
};
