import type {
    PasswordGenerationInputV1,
    VaultItemPayloadV1,
} from "@password-manager/shared-types";

export function buildGenerationInputFromVaultItem(
    payload: VaultItemPayloadV1,
): PasswordGenerationInputV1{
    return{
        algorithmVersion: 1,
        site: payload.site.kind === "domain"?{
            kind: "domain",
            normalizedDomain: payload.site.normalizedDomain,
        }:{
            kind: "label",
            generationLabel: payload.site.generationLabel,
        },
        usernameOrEmail: payload.usernameOrEmail,
        passwordProfile: payload.passwordProfile,
    };
}