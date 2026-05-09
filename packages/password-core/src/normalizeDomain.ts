import type { Result } from "@password-manager/shared-types";

export function normalizeDomain(input: string): Result<string> {
  const trimmed = input.trim().toLowerCase();

  if (!trimmed) {
    return {
      ok: false,
      error: {
        code: "INVALID_DOMAIN",
        message: "Domain is required.",
      },
    };
  }

  let value = trimmed;

  value = value.replace(/^https?:\/\//, "");
  value = value.split("#")[0] ?? value;
  value = value.split("?")[0] ?? value;
  value = value.split("/")[0] ?? value;

  if (value.startsWith("www.")) {
    value = value.slice(4);
  }

  if (!value || !value.includes(".")) {
    return {
      ok: false,
      error: {
        code: "INVALID_DOMAIN",
        message: "Domain must look like a valid domain.",
      },
    };
  }

  return {
    ok: true,
    value,
  };
}
