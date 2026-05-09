import {z} from 'zod';
export const passwordProfileSchema = z.object({
    length: z.number().int().min(12).max(128),

    includeUppercase: z.boolean(),
    includeLowercase: z.boolean(),
    includeNumbers: z.boolean(),
    includeSymbols: z.boolean(),

    allowedSymbols: z.string(),

    passwordVersion: z.number().int().min(1),

    avoidAmbiguousCharacters: z.boolean(),
    requiredStartWithLetter: z.boolean(),
}).superRefine((profile, ctx) => {
    const enabledClass = [
        profile.includeUppercase,
        profile.includeLowercase,
        profile.includeNumbers,
        profile.includeSymbols,
    ].filter(Boolean).length;

    if(enabledClass === 0){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['includeLowercase'],
            message: "At least one character class must be enabled.",
        });
    }
    if(profile.includeSymbols && profile.allowedSymbols.length === 0){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["allowedSymbols"],
            message: "Allowed symbols are required when symbols are enabled.",
        });
    }
    if(profile.length < enabledClass){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["length"],
            message: "Password length is too short for the selected rules."
        });
    }
    const hasLetterClass = profile.includeUppercase || profile.includeLowercase;
    if(profile.requiredStartWithLetter && !hasLetterClass){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['requiredStartWithLetter'],
            message:  "At least one letter class must be enabled when the password must start with a letter.",
        });
    }
});

export type PasswordProfileSchema = z.infer<typeof passwordProfileSchema>;
