import { describe, expect, it } from "vitest";
import { defaultPasswordProfileV1 } from "@password-manager/shared-types";
import { mapBytesToPassword } from "../src/mapBytesToPassword";

describe("mapBytesToPassword", () => {
  it("maps bytes to a password with the requested length", () => {
    // These bytes intentionally hit lowercase, uppercase, number, and symbol ranges.
    const result = mapBytesToPassword({
      bytes: new Uint8Array([
        0, 26, 52, 62, 1, 27, 53, 63, 2, 28,
        54, 64, 3, 29, 55, 65, 4, 30, 56, 66,
      ]),
      profile: defaultPasswordProfileV1,
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value).toHaveLength(defaultPasswordProfileV1.length);
    }
  });

  it("rejects insufficient bytes", () => {
    const result = mapBytesToPassword({
      bytes: new Uint8Array([1, 2, 3]),
      profile: defaultPasswordProfileV1,
    });

    expect(result.ok).toBe(false);
  });
});
