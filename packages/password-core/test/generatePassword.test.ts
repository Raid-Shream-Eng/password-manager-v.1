import { describe, expect, it } from "vitest";
import {
  defaultPasswordProfileV1,
  type PasswordGenerationInputV1,
} from "@password-manager/shared-types";
import { generatePassword } from "../src/generatePassword";

const fakeCrypto = {
  async hmacSha256(): Promise<Uint8Array> {
    return new Uint8Array([
      0, 26, 52, 62, 1, 27, 53, 63, 2, 28,
      54, 64, 3, 29, 55, 65, 4, 30, 56, 66,
      5, 31, 57, 67, 6, 32, 58, 68, 7, 33,
      59, 69,
    ]);
  },
};

describe("generatePassword", () => {
  it("generates a password with the requested length", async () => {
    const input: PasswordGenerationInputV1 = {
      algorithmVersion: 1,
      site: {
        kind: "domain",
        normalizedDomain: "example.com",
      },
      usernameOrEmail: "raid@example.com",
      passwordProfile: defaultPasswordProfileV1,
    };

    const result = await generatePassword({
      input,
      passwordGenerationKey: new Uint8Array([1, 2, 3]),
      crypto: fakeCrypto,
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value.length).toBe(20);
    }
  });
});
