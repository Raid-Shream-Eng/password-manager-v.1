import * as ExpoCrypto from "expo-crypto";
import type { CryptoResult } from "./types";

export function randomBytes(length: number): CryptoResult<Uint8Array>{
    try{
        if (!Number.isInteger(length)|| length<=0 ){
            return{
                ok: false,
                error: {
                    code: "CRYPTO_RANDOM_FAILED",
                    message:"Random byte length must be a positive integer.",
                },
            };
        }
        return{
            ok:true,
            value: ExpoCrypto.getRandomBytes(length),
        };
    }catch (cause){
        return {
            ok:false,
            error: {
                code: "CRYPTO_RANDOM_FAILED",
                message: "Failed to generate secure random bytes.",
                cause
            },
        };
    }
}