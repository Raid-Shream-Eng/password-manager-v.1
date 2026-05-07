import {describe, expect, it} from 'vitest';
import {generatePassword} from './generatePassword';
import { validatePasswordProfile } from './index';
import type { GenerationInput, PasswordCoreCryptoProvider } from './index';

const cryptoProvider: PasswordCoreCryptoProvider = {
    async hmacSha256(key, data) {
        const output = new Uint8Array(32);

        for (let i = 0; i < output.length; i++) {
            let value = key[i % key.length]! ^ i;
             for (let j = 0; j < data.length; j++) {
              value = (value + data[j]! + j + i) % 256;
              value = ((value << 5) | (value >>> 3)) & 255;
             }
            output[i] = value;
        }
        return output;
    },
};



const masterKey = new TextEncoder().encode("test-master-key");

const baseInput: GenerationInput = {
  algorithmVersion: 1,
  account: {
    kind: "domain",
    domain: "example.com",
  },
  usernameOrEmail: "user@example.com",
  passwordProfile: {
    length: 24,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    allowedSymbols: "!@#$",
    passwordVersion: 1,
    avoidAmbiguousCharacters: false,
    requiredStartWithLetter: false,
  },
};


async function generate(input: GenerationInput): Promise<string> {
    return await generatePassword({
        masterKey,
        input,
        cryptoProvider,
    });
}

describe("generatePassword", () => {
  it("same input gives same password", async () => {
    await expect(generate(baseInput)).resolves.toBe(await generate(baseInput));
  });

  it("different domain gives different password", async () => {
    await expect(
      generate({
        ...baseInput,
        account: {
          kind: "domain",
          domain: "different.com",
        },
      }),
    ).resolves.not.toBe(await generate(baseInput));
  });

  it("different generation label gives different password", async () => {
    await expect(
      generate({
        ...baseInput,
        account: {
          kind: "label",
          generationLabel: "work",
        },
      }),
    ).resolves.not.toBe(await generate(baseInput));
  });

  it("different username/email gives different password", async () => {
    await expect(
      generate({
        ...baseInput,
        usernameOrEmail: "other@example.com",
      }),
    ).resolves.not.toBe(await generate(baseInput));
  });

  it("different password version gives different password", async () => {
    await expect(
      generate({
        ...baseInput,
        passwordProfile: {
          ...baseInput.passwordProfile,
          passwordVersion: 2,
        },
      }),
    ).resolves.not.toBe(await generate(baseInput));
  });

  it("different password profile gives different password", async () => {
    await expect(
      generate({
        ...baseInput,
        passwordProfile: {
          ...baseInput.passwordProfile,
          length: 20,
        },
      }),
    ).resolves.not.toBe(await generate(baseInput));
  });

  it("displayName does not affect password", async () => {
    await expect(
      generate({
        ...baseInput,
        displayName: "Google Mail",
      }),
    ).resolves.toBe(await generate(baseInput));
  });

  it("notes do not affect password", async () => {
    await expect(
      generate({
        ...baseInput,
        notes: "Recovery notes",
      }),
    ).resolves.toBe(await generate(baseInput));
  });

  it("createdAt and updatedAt do not affect password", async () => {
    await expect(
      generate({
        ...baseInput,
        createdAt: "2026-05-07T10:00:00.000Z",
        updatedAt: "2026-05-07T11:00:00.000Z",
      }),
    ).resolves.toBe(await generate(baseInput));
  });

  it("lastUsedAt, theme, and language do not affect password", async () => {
    await expect(
      generate({
        ...baseInput,
        lastUsedAt: "2026-05-07T12:00:00.000Z",
        theme: "dark",
        language: "ar",
      }),
    ).resolves.toBe(await generate(baseInput));
  });

  it("output length is exact", async () => {
    const password = await generate(baseInput);

    expect(password).toHaveLength(baseInput.passwordProfile.length!);
  });

  it("output respects allowed symbols", async () => {
    const password = await generate(baseInput);

    expect(password).toMatch(/^[A-Za-z0-9!@#$]+$/);
  });

  it("required character classes are guaranteed", async () => {
    const password = await generate(baseInput);

    expect(password).toMatch(/[A-Z]/);
    expect(password).toMatch(/[a-z]/);
    expect(password).toMatch(/[0-9]/);
    expect(password).toMatch(/[!@#$]/);
  });

  it("avoids ambiguous characters when enabled", async () => {
    const password = await generate({
      ...baseInput,
      passwordProfile: {
        ...baseInput.passwordProfile,
        avoidAmbiguousCharacters: true,
      },
    });

    expect(password).not.toMatch(/[O0Il1]/);
  });

  it("starts with a letter when required", async () => {
    const password = await generate({
      ...baseInput,
      passwordProfile: {
        ...baseInput.passwordProfile,
        requiredStartWithLetter: true,
      },
    });

    expect(password[0]).toMatch(/[A-Za-z]/);
  });
});
describe("validatePasswordProfile", () => {
  it("invalid profile returns error", () => {
    const result = validatePasswordProfile({
      length: 4,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: false,
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe("INVALID_PASSWORD_PROFILE");
    }
  });

  it("empty allowedSymbols with symbols enabled returns error", () => {
    const result = validatePasswordProfile({
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      allowedSymbols: "",
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe("INVALID_PASSWORD_PROFILE");
    }
  });
});
