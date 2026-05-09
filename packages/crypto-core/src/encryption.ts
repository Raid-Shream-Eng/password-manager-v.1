import { xchacha20poly1305 } from "@noble/ciphers/chacha.js";
import type { AeadAlgorithm, CryptoResult } from "./types";
import { randomBytes } from "./randomBytes";

const ALGORITHM: AeadAlgorithm = "XChaCha20-Poly1305";
const KEY_LENGTH = 32;
const NONCE_LENGTH = 24;

export async function encryptAead(params:{
    key: Uint8Array;
    plaintext: Uint8Array;
    associatedData?: Uint8Array;
}): Promise<CryptoResult<{algorithm: AeadAlgorithm;
    nonce: Uint8Array;
    ciphertext: Uint8Array;
    }>
> {
    try {
        if (params.key.length !== KEY_LENGTH) {
            return {
                ok: false,
                error: {
                    code: "INVALID_KEY_LENGTH",
                    message: "xChaCha20-Poly1305 requires a 32-byte key."
                },
            };
        }
        const nonceResult = randomBytes(NONCE_LENGTH);
        if (!nonceResult.ok) {
            return nonceResult;
        }
        const cipher = xchacha20poly1305(
            params.key,
            nonceResult.value,
            params.associatedData,
        );
        return{
            ok:true,
            value:{
            algorithm: ALGORITHM,
            nonce: nonceResult.value,
            ciphertext: cipher.encrypt(params.plaintext),
            },
        };
    } catch (cause) {
        return {
            ok: false,
            error: {
                code: "CRYPTO_ENCRYPT_FAILED",
                message: "Failed to encrypt with XChaCha20-Poly1305.",
                cause,
            },
        };
    }
}

export async function decryptAead(params:{
    key: Uint8Array;
    nonce: Uint8Array;
    ciphertext: Uint8Array;
    associatedData?: Uint8Array;
    algorithm: AeadAlgorithm;
}): Promise<CryptoResult<Uint8Array>>{
    try {
        if (params.algorithm !== ALGORITHM){
            return {
                ok: false,
                error: {
                    code: "CRYPTO_UNSUPPORTED",
                    message: "Unsupported AEAD algorithm."
                },
            };
        }
        if (params.key.length !== KEY_LENGTH) {
            return {
                ok: false,
                error: {
                    code: "INVALID_KEY_LENGTH",
                    message: "XChaCha20-Poly1305 requires a 32-byte key.",
                },
            };
        }
        if(params.nonce.length !== NONCE_LENGTH){
            return {
                ok: false,
                error: {
                    code: "INVALID_NONCE_LENGTH",
                    message: "XChaCha20-Poly1305 requires a 24-byte nonce.",
                },
            };
        }
        const cipher = xchacha20poly1305(
            params.key,
            params.nonce,
            params.associatedData,
        );
        return{
            ok: true,
            value: cipher.decrypt(params.ciphertext),
        };
    } catch (cause) {
        return{
            ok:false,
            error: {
                code: "CRYPTO_DECRYPT_FAILED",
                message: "Failed to decrypt with XChaCha20-Poly1305.",
                cause,
            },
        };
    }   
}