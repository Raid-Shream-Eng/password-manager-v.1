import type { CryptoProvider } from "./types";
import { randomBytes } from "./randomBytes";
import { hmacSha256 } from "./hmac";
import { hkdfSha256 } from "./hkdf";
import { encryptAead, decryptAead } from "./encryption";

export function createCryptoProvider(): CryptoProvider {
  return {
    randomBytes,
    hmacSha256,
    hkdfSha256,
    encryptAead,
    decryptAead,
  };
}