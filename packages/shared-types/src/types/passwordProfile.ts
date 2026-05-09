export type PasswordProfileV1 = {
    length: number;

    includeUppercase: boolean;
    includeLowercase: boolean;
    includeNumbers: boolean;
    includeSymbols: boolean;

    allowedSymbols: string;

    passwordVersion: number;

    avoidAmbiguousCharacters: boolean;
    requiredStartWithLetter: boolean;
};

export const defaultPasswordProfileV1: PasswordProfileV1 = {
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
