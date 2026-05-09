import { PasswordProfileV1 } from "./passwordProfile";

export type PasswordGenerationInputV1 = {
    algorithmVersion: 1;
    site: |{
        kind: "domain";
        normalizedDomain: string;
    } | {
        kind: "label";
        generationLabel: string;
    };

    usernameOrEmail: string;
    passwordProfile: PasswordProfileV1;
};

export type PasswordGenerationAttemptInputV1 = {
    input: PasswordGenerationInputV1;
    attempt: number;
};

export const PASSWORD_GENERATION_ALGORITHM_VERSION = 1;
export const MAX_GENERATION_ATTEMPTS = 100;