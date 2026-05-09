import type { Result } from "@password-manager/shared-types";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * Produces stable JSON by sorting object keys recursively.
 * This is important because password generation must be deterministic.
 */
export function canonicalizeJson(value: JsonValue): Result<string> {
  try {
    return {
      ok: true,
      value: JSON.stringify(sortJson(value)),
    };
  } catch (cause) {
    return {
      ok: false,
      error: {
        code: "CANONICALIZE_FAILED",
        message: "Failed to canonicalize JSON.",
        cause,
      },
    };
  }
}

function sortJson(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map(sortJson);
  }

  if (value !== null && typeof value === "object") {
    const sorted: { [key: string]: JsonValue } = {};

    for (const key of Object.keys(value).sort()) {
      sorted[key] = sortJson(value[key]!);
    }

    return sorted;
  }

  return value;
}
