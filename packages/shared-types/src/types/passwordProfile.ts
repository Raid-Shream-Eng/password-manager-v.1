export type PasswordProfile = {
    length: number;

    includeUppercase: boolean;
    includeLowercase: boolean;
    includeNumbers: boolean;
    includeSymbols: boolean;

    allowedSymbols?: string;

    passwordVersion: number;

    avoidAmbiguousCharacters: boolean;
    requiredStartWithLetter: boolean;
};

export const defaultPasswordProfile: PasswordProfile = {
    length: 20, 

    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,

    allowedSymbols: "!@#$%^&*_-+=?",

    passwordVersion: 1,

    avoidAmbiguousCharacters: false,
    requiredStartWithLetter: false,
};
