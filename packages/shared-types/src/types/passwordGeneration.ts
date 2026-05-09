import { PasswordProfile } from "./passwordProfile";

export type PasswordGenerationInput = {
    algorithmVersion: 1;
    site: |{
        kind: "domain";
        normalizedDomain: string;
    } | {
        kind: "label";
        generationLabel: string;
    };

    usernameOrEmail: string;
    passwordProfile: PasswordProfile;
};

export type PasswordGenerationAttemptInput = {
    input: PasswordGenerationInput;
    attemptNumber: number;
};

export const PASSWORD_GENERATION_ALGORITHM_VERSION = 1;
export const MAX_GENERATION_ATTEMPTS = 100;