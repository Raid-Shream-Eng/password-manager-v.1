import type { Result } from "@password-manager/shared-types";

export type CryptoErrorCode = 
| "CRYPTO_RANDOM_FAILED"
| "CRYPTO_HMAC_FAILED"
| "CRYPTO_HKDF_FAILED"
| "CRYPTO_ENCRYPT_FAILED"
| "CRYPTO_DECRYPT_FAILED"
| "CRYPTO_UNSUPPORTED"
| "INVALID_KEY_LENGTH"
| "INVALID_NONCE_LENGTH";

export type CryptoError = {
    code: CryptoErrorCode;
    message?: string;
    cause?: unknown;
};

export type CryptoResult<T> = Result<T, CryptoError>;

export type AeadAlgorithm = "XChaCha20-Poly1305";

export type CryptoProvider = {
  randomBytes(length: number): CryptoResult<Uint8Array>;

  hmacSha256(
    key: Uint8Array,
    message: Uint8Array,
  ): Promise<CryptoResult<Uint8Array>>;

  hkdfSha256(params: {
    inputKeyMaterial: Uint8Array;
    salt: Uint8Array;
    info: Uint8Array;
    length: number;
  }): Promise<CryptoResult<Uint8Array>>;

  encryptAead(params: {
    key: Uint8Array;
    plaintext: Uint8Array;
    associatedData?: Uint8Array;
  }): Promise<
    CryptoResult<{
      algorithm: AeadAlgorithm;
      nonce: Uint8Array;
      ciphertext: Uint8Array;
    }>
  >;

  decryptAead(params: {
    key: Uint8Array;
    nonce: Uint8Array;
    ciphertext: Uint8Array;
    associatedData?: Uint8Array;
    algorithm: AeadAlgorithm;
  }): Promise<CryptoResult<Uint8Array>>;
};
