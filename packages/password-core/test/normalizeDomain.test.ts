import { describe, expect, it } from "vitest";
import { normalizeDomain } from "../src/normalizeDomain";

describe("normalizeDomain", () => {
  it("lowercases and removes protocol/path/query", () => {
    const result = normalizeDomain("https://www.Google.com/login?x=1");

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value).toBe("google.com");
    }
  });

  it("trims spaces", () => {
    const result = normalizeDomain("  WWW.GITHUB.COM/Raid-Shream-Eng  ");

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value).toBe("github.com");
    }
  });

  it("rejects empty input", () => {
    const result = normalizeDomain("");

    expect(result.ok).toBe(false);
  });
});
