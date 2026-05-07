import { normalizeDomain } from "./normalizeDomain";
import {
    type PasswordProfile,
    type ValidPasswordProfile,
    validatePasswordProfile,
} from "./validatePasswordProfile";
export type GenerationInput = {
    domain: string;
    label?: string;
    username?: string;
    counter?: number;
    profile: PasswordProfile;
};
export type CanonicalGenerationInput = {
    version: 1;
    domain: string;
    label: string;
    username: string;
    counter: number;
    profile: ValidPasswordProfile;
};
export function canonicalizeGenerationInput(input: GenerationInput): CanonicalGenerationInput {
    const profileResult = validatePasswordProfile(input.profile);
    if (!profileResult.ok) {
        throw new Error(profileResult.error.message ?? "Invalid password profile");
    }
    const counter =  input.counter ?? 1;
    if (!Number.isInteger(counter) || counter < 1) {
        throw new Error("Counter must be a positive integer.");
    }
    return {
        version: 1,
        domain: normalizeDomain(input.domain),
        label: input.label ?? "",
        username: input.username ?? "",
        counter,
        profile: profileResult.value,
    };
}
export function encodeCanonicalGenerationInput(input: CanonicalGenerationInput): Uint8Array {
    return new TextEncoder().encode(JSON.stringify(input));
}