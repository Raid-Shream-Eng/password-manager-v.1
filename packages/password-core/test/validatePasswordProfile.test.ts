import { describe, expect, it } from "vitest";
import { defaultPasswordProfileV1 } from "@password-manager/shared-types";
import { validatePasswordProfile } from "../src/validatePasswordProfile";

describe("validatePasswordProfile", () => {
  it("accepts the default profile", () => {
    const result = validatePasswordProfile(defaultPasswordProfileV1);

    expect(result.ok).toBe(true);
  });

  it("rejects empty symbols when symbols are enabled", () => {
    const result = validatePasswordProfile({
      ...defaultPasswordProfileV1,
      includeSymbols: true,
      allowedSymbols: "",
    });

    expect(result.ok).toBe(false);
  });

  it("rejects length below 12", () => {
    const result = validatePasswordProfile({
      ...defaultPasswordProfileV1,
      length: 8,
    });

    expect(result.ok).toBe(false);
  });
});
