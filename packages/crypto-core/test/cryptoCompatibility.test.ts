import { describe, expect, it } from "vitest";
import { utf8ToBytes, bytesToUtf8 } from "../src/encoding";

/**
 * This is a contract test template.
 *
 * After choosing the actual crypto provider, import it here and enable the tests.
 */

// import { createCryptoProvider } from "../src/createCryptoProvider";

describe("crypto-core compatibility contract", () => {
  it("documents required crypto behavior", () => {
    const requirements = [
      "secure random bytes",
      "HMAC-SHA-256",
      "HKDF-SHA-256",
      "authenticated encryption",
      "authenticated decryption",
      "tamper detection",
      "Expo compatibility",
      "Android APK compatibility",
    ];

    expect(requirements).toContain("secure random bytes");
  });

  it("can encode and decode UTF-8 text", () => {
    const text = "password-manager-vault";
    const bytes = utf8ToBytes(text);
    const decoded = bytesToUtf8(bytes);

    expect(decoded).toBe(text);
  });
});
