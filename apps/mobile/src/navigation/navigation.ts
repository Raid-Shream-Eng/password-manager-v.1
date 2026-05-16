import type {
    PasswordGenerationInputV1,
    PasswordProfileV1,
    passwordProfileV1Schema,
    SiteIdentifier,
} from "@password-manager/shared-types";
export type GeneratedPasswordResultParams = {
    displayName: string,
    site: SiteIdentifier,
    usernameOrEmail: string,
    passwordProfile: PasswordProfileV1;
    generationInput: PasswordGenerationInputV1; 
};

export type UnlockStackParamList = {
    Home: undefined;
    QuickGenerator: undefined;
    GeneratedPasswordResult: GeneratedPasswordResultParams;
    SaveGeneratedProfile: {
        displayName: string;
        site: SiteIdentifier;
        usernameOrEmail: string;
        passwordProfile: PasswordProfileV1;
    };
};