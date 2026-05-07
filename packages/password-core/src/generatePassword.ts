import {
    canonicalizeGenerationInput,
    encodeCanonicalGenerationInput,
    type GenerationInput,
} from './canonicalize';

import { mapBytesToPassword } from './mapBytesToPassword';

export type PasswordCoreCryptoProvider = {
    hmacSha256: (key: Uint8Array, data: Uint8Array) => Promise<Uint8Array>;
};
export async function generatePassword(params: {
    masterKey: Uint8Array;
    input: GenerationInput;
    cryptoProvider: PasswordCoreCryptoProvider;
}): Promise<string> {
    const canonicalInput= canonicalizeGenerationInput(params.input);
    const message = encodeCanonicalGenerationInput(canonicalInput);
    const bytes = await params.cryptoProvider.hmacSha256(params.masterKey, message);
    return mapBytesToPassword(bytes, canonicalInput.passwordProfile);

}