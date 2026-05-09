import { hmac } from "@noble/hashes/hmac.js";
import { sha256 } from "@noble/hashes/sha2.js";
import type { CryptoResult } from "./types";

export async function hmacSha256(
    key: Uint8Array,
    message: Uint8Array,
): Promise<CryptoResult<Uint8Array>>{
    try {
        return{
            ok:true,
            value: hmac(sha256, key, message),
        };
    } catch (cause) {
        return{
            ok:false,
            error:{
                code: "CRYPTO_HMAC_FAILED",
                message: "Failed to compute HMAC-SHA-256.",
                cause,
            },
        };
    }
}