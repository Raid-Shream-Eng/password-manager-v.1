import { z } from "zod";
import { passwordProfileV1Schema } from "@password-manager/shared-types";

export const editVaultItemSchema = z
  .object({
    identifierType: z.enum(["domain", "label"]),

    displayName: z.string().min(1, "Display name is required."),

    domainInput: z.string().optional(),
    labelInput: z.string().optional(),

    usernameOrEmail: z.string().min(1, "Username or email is required."),

    passwordProfile: passwordProfileV1Schema,

    notes: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.identifierType === "domain") {
      if (!value.domainInput || value.domainInput.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["domainInput"],
          message: "Domain is required.",
        });
      }
    }

    if (value.identifierType === "label") {
      if (!value.labelInput || value.labelInput.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["labelInput"],
          message: "Label is required.",
        });
      }
    }
  });

export type EditVaultItemFormValues = z.infer<typeof editVaultItemSchema>;
