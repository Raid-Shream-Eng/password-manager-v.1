import { hkdf } from "@noble/hashes/hkdf.js";
import { sha256 } from "@noble/hashes/sha2.js";
import type { CryptoResult } from "./types";

export async function hkdfSha256(params:{
    inputKeyMaterial: Uint8Array;
    salt: Uint8Array;
    info: Uint8Array;
    length:number;
}):Promise<CryptoResult<Uint8Array>> {
    try {
        return{
            ok: true,
            value: hkdf(
                sha256,
                params.inputKeyMaterial,
                params.salt,
                params.info,
                params.length,
            ),
        };
    } catch (cause) {
        return {
            ok: false,
            error: {
                code: "CRYPTO_HKDF_FAILED",
                message: "Failed to derive key using HKDF-Sha256.",
                cause,
            }
        };
    }
}