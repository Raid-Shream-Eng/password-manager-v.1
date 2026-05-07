import { normalizeDomain } from "./normalizeDomain";
import { normalizeGenerationLabel } from "./normalizeGenerationLabel";
import {
    type PasswordProfile,
    type ValidPasswordProfile,
    validatePasswordProfile,
} from "./validatePasswordProfile";

export type GenerationAccountIdentifier =
  | {
      kind: "domain";
      domain: string;
    }
  | {
      kind: "label";
      generationLabel: string;
    };

export type GenerationInput = {
  algorithmVersion: 1;
  account: GenerationAccountIdentifier;
  usernameOrEmail: string;
  passwordProfile: PasswordProfile;

  displayName?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  lastUsedAt?: string;
  theme?: string;
  language?: string;
};

export type CanonicalGenerationInput = {
  algorithmVersion: 1;
  account:
    | {
        kind: "domain";
        normalizedDomain: string;
      }
    | {
        kind: "label";
        generationLabel: string;
      };
  usernameOrEmail: string;
  passwordProfile: ValidPasswordProfile;
};
export function canonicalizeGenerationInput(input: GenerationInput): CanonicalGenerationInput {
  const profileResult = validatePasswordProfile(input.passwordProfile);

  if (!profileResult.ok) {
    throw new Error(profileResult.error.message ?? "Invalid password profile");
  }

  const account =
    input.account.kind === "domain"
      ? {
          kind: "domain" as const,
          normalizedDomain: normalizeDomain(input.account.domain),
        }
      : {
          kind: "label" as const,
          generationLabel: normalizeGenerationLabel(input.account.generationLabel),
        };

  return {
    algorithmVersion: input.algorithmVersion,
    account,
    usernameOrEmail: input.usernameOrEmail,
    passwordProfile: profileResult.value,
  };
}

export function encodeCanonicalGenerationInput(input: CanonicalGenerationInput): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(input));
}
