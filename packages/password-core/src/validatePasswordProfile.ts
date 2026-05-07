import type { Result } from "@password-manager/shared-types";

export type PasswordProfile = {
    length: number;
    includeUppercase: boolean;
    includeLowercase: boolean;
    includeNumbers: boolean;
    includeSymbols: boolean;
    symbols?: string;
};

export type ValidPasswordProfile= {
    length: number;
    includeUppercase: boolean;
    includeLowercase: boolean;
    includeNumbers: boolean;
    includeSymbols: boolean;
    symbols: string;
}

export function validatePasswordProfile(
    profile: PasswordProfile
    ): Result<ValidPasswordProfile> {
        const normalized: ValidPasswordProfile = {
        length: profile.length,
        includeUppercase: profile.includeUppercase,
        includeLowercase: profile.includeLowercase,
        includeNumbers: profile.includeNumbers,
        includeSymbols: profile.includeSymbols,
        symbols: profile.symbols ?? "!@#$%^&*_-+=?",
        };
        if (!Number.isInteger(normalized.length) 
            || normalized.length < 8 
        || normalized.length > 128) 
        {
            return { ok: false, error:{
                code: "INVALID_PASSWORD_PROFILE", 
                message: "Password length must be an integer between 8 and 128."
            }};
        }
        const enabledCount = [
            normalized.includeUppercase,
            normalized.includeLowercase,
            normalized.includeNumbers,
            normalized.includeSymbols
        ].filter(Boolean).length;
        if (enabledCount === 0) {
            return { ok: false, error:{
                code: "INVALID_PASSWORD_PROFILE", 
                message: "At least one character type must be included."
            }};
        }
        if (normalized.includeSymbols && normalized.symbols.length === 0) {
            return { ok: false, error:{
                code: "INVALID_PASSWORD_PROFILE", 
                message: "Symbols cannot be empty when symbols are enabled."
            }};
        }
        if (normalized.length < enabledCount) {
            return { ok: false, error:{
                code: "INVALID_PASSWORD_PROFILE", 
                message: "Password length is too short for the enabled character types."
            }};
        }
        return { ok: true, value: normalized };
    }