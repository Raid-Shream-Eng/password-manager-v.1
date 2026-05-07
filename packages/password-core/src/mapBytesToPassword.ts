import {type ValidPasswordProfile} from "./validatePasswordProfile";

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBER = "0123456789";
const AMBIGUOUS = new Set(["O", "0", "I", "l", "1"]);

function removeAmbiguousCharacters(chars: string): string {
    return [...chars].filter((char)=> !AMBIGUOUS.has(char)).join("");
}

function pick(chars: string, byte: number): string {
    return chars[byte % chars.length]!;
}

export function mapBytesToPassword(
    bytes: Uint8Array,
    profile: ValidPasswordProfile
): string {
    if (bytes.length === 0) {
        throw new Error("Bytes are required");
    }   

    const groups: string[] = [];

    const uppercase = profile.includeUppercase ? (profile.avoidAmbiguousCharacters ? removeAmbiguousCharacters(UPPERCASE) : UPPERCASE) : "";
    const lowercase = profile.includeLowercase ? (profile.avoidAmbiguousCharacters ? removeAmbiguousCharacters(LOWERCASE) : LOWERCASE) : "";
    const numbers = profile.includeNumbers ? (profile.avoidAmbiguousCharacters ? removeAmbiguousCharacters(NUMBER) : NUMBER) : "";
    const symbols = profile.includeSymbols ? (profile.avoidAmbiguousCharacters ? removeAmbiguousCharacters(profile.allowedSymbols) : profile.allowedSymbols) : "";
    if (profile.includeUppercase) {groups.push(uppercase);}
    if (profile.includeLowercase) {groups.push(lowercase);}
    if (profile.includeNumbers) {groups.push(numbers);}
    if (profile.includeSymbols) {groups.push(symbols);}

    const allChars = groups.join("");
    const letterChars = [
        profile.includeUppercase ? uppercase : "",
        profile.includeLowercase ? lowercase : "",
    ].join("");
    const password: string[] = [];
    let index = 0;
    if (profile.requiredStartWithLetter) {
        password.push(pick(letterChars, bytes[index % bytes.length]!));
        index++;
    }

    for (const group of groups) {
        password.push(pick(group, bytes[index % bytes.length]!));
        index++;
    }

    while (password.length < profile.length) {
        password.push(pick(allChars, bytes[index % bytes.length]!));
        index++;
    }

   const minShuffleIndex = profile.requiredStartWithLetter ? 1 : 0;
   for (let i = password.length - 1; i > minShuffleIndex; i--) {
        const j = bytes[index % bytes.length]! % (i + 1);

        if (j< minShuffleIndex) {
            index++;
            continue;
        }
        const current = password[i]!;
        const swap = password[j]!;
        password[i] = swap;
        password[j] = current;
        index++;
    }
    

    return password.join("");
}
