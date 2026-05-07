import {type ValidPasswordProfile} from "./validatePasswordProfile";

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBER = "0123456789";

function pick(chars: string, byte: number): string {
    return chars[byte % chars.length];
}

export function mapBytesToPassword(
    bytes: Uint8Array,
    profile: ValidPasswordProfile
): string {
    if (bytes.length === 0) {
        throw new Error("Bytes are required");
    }   

    const groups: string[] = [];

    if (profile.includeUppercase) {groups.push(UPPERCASE);}
    if (profile.includeLowercase) {groups.push(LOWERCASE);}
    if (profile.includeNumbers) {groups.push(NUMBER);}
    if (profile.includeSymbols) {groups.push(profile.symbols);}

    const allChars = groups.join("");
    const password: string[] = [];
    let index = 0;

    for (const group of groups) {
        password.push(pick(group, bytes[index % bytes.length]));
        index++;
    }

    while (password.length < profile.length) {
        password.push(pick(allChars, bytes[index % bytes.length]));
        index++;
    }

    for (let i = password.length - 1; i > 0; i--) {
        const j = bytes[index % bytes.length] % (i + 1);
        [password[i], password[j]] = [password[j], password[i]];
        index++;
    }

    return password.join("");
}