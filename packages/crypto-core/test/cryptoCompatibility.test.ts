import { describe, expect, it, vi } from "vitest";
import { createCryptoProvider, utf8ToBytes, bytesToUtf8 } from "../src";

vi.mock("expo-crypto",()=>{
  return{
     getRandomBytes(length: number): Uint8Array {
      const bytes = new Uint8Array(length);
      globalThis.crypto.getRandomValues(bytes);
      return bytes;
    },
  };
});
describe("crypto-core provider", ()=>{
  const crypto =  createCryptoProvider();
  it("generates secure random bytes with requested length",()=>{
    const result = crypto.randomBytes(32);
    expect(result.ok).toBe(true);
    if( result.ok){
      expect(result.value.length).toBe(32);
      expect([...result.value].every((byte)=> byte === 0)).toBe(false);
    }
  });
  it("computes deterministic HMAC-SHA-256",async ()=>{
    const key = utf8ToBytes("test-key");
    const message = utf8ToBytes("test-message");

    const first = await crypto.hmacSha256(key, message);
    const second = await crypto.hmacSha256(key, message);

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);

    if (first.ok && second.ok) {
      expect([...first.value]).toEqual([...second.value]);
      expect(first.value.length).toBe(32);
    }
  });
  
  it("derives deterministic HKDF output", async () => {
    const first = await crypto.hkdfSha256({
      inputKeyMaterial: utf8ToBytes("root-key"),
      salt: utf8ToBytes("salt"),
      info: utf8ToBytes("password-generation"),
      length: 32,
    });

    const second = await crypto.hkdfSha256({
      inputKeyMaterial: utf8ToBytes("root-key"),
      salt: utf8ToBytes("salt"),
      info: utf8ToBytes("password-generation"),
      length: 32,
    });

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);

    if (first.ok && second.ok) {
      expect([...first.value]).toEqual([...second.value]);
      expect(first.value.length).toBe(32);
    }
  });

  it("encrypts and decrypts authenticated data", async () => {
    const keyResult = crypto.randomBytes(32);

    expect(keyResult.ok).toBe(true);

    if (!keyResult.ok) {
      return;
    }

    const plaintext = utf8ToBytes("secret vault payload");
    const associatedData = utf8ToBytes("vault-id");

    const encrypted = await crypto.encryptAead({
      key: keyResult.value,
      plaintext,
      associatedData,
    });

    expect(encrypted.ok).toBe(true);

    if (!encrypted.ok) {
      return;
    }

    const decrypted = await crypto.decryptAead({
      key: keyResult.value,
      nonce: encrypted.value.nonce,
      ciphertext: encrypted.value.ciphertext,
      associatedData,
      algorithm: encrypted.value.algorithm,
    });

    expect(decrypted.ok).toBe(true);

    if (decrypted.ok) {
      expect(bytesToUtf8(decrypted.value)).toBe("secret vault payload");
    }
  });

  it("rejects tampered ciphertext", async () => {
    const keyResult = crypto.randomBytes(32);

    expect(keyResult.ok).toBe(true);

    if (!keyResult.ok) {
      return;
    }

    const encrypted = await crypto.encryptAead({
      key: keyResult.value,
      plaintext: utf8ToBytes("secret vault payload"),
      associatedData: utf8ToBytes("vault-id"),
    });

    expect(encrypted.ok).toBe(true);

    if (!encrypted.ok) {
      return;
    }

    const tamperedCiphertext = new Uint8Array(encrypted.value.ciphertext);
    tamperedCiphertext[0] = tamperedCiphertext[0] ^ 1;

    const decrypted = await crypto.decryptAead({
      key: keyResult.value,
      nonce: encrypted.value.nonce,
      ciphertext: tamperedCiphertext,
      associatedData: utf8ToBytes("vault-id"),
      algorithm: encrypted.value.algorithm,
    });

    expect(decrypted.ok).toBe(false);
  });
});
