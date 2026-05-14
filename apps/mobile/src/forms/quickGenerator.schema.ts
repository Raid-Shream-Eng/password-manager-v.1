import{ z } from "zod";
import{ passwordProfileV1Schema, siteIdentifierSchema }from"@password-manager/shared-types";
import { VaultCreationService } from "../services/VaultCreationService";

export const quickGeneratorSchema = z.object({
    identifierType: z.enum(["domain","label"]),
    desplayName: z.string().min(1, "Display or email is required."),
    domainInput: z.string().optional(),
    labelInput: z.string().optional(),
    userNameOrEmail: z.string().min(1, "Username or E-mail is requaired."),
    passwordProfile: passwordProfileV1Schema,
}).superRefine((Value , ctx)=> {
    if (Value.identifierType === "domain") {
        if (!Value.domainInput || Value.domainInput.trim().length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path:["domainInput"],
                message: "Label is required."
            });
        }
    }
    if (Value.identifierType === "label") {
        if (!Value.labelInput || Value.labelInput.trim().length === 0 ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["labelInput"],
                message: "Label is required."
            });
        }
    }
});

export type QuickGeneratorFormValues = z.infer<typeof quickGeneratorSchema>;