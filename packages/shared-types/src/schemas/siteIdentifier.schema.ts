import {z} from 'zod';

export const domainSiteIdentifierSchema = z.object({
    kind: z.literal('domain'),
    displayName: z.string().min(1),
    normalizedDomain: z.string().min(1),
});

export const labelSiteIdentifierSchema = z.object({
    kind: z.literal('label'),
    displayName: z.string().min(1),
    generationLabel: z.string().min(1),
});

export const siteIdentifierSchema = z.discriminatedUnion('kind', [
    domainSiteIdentifierSchema,
    labelSiteIdentifierSchema,
]);
export type SiteIdentifierSchema = z.infer<typeof siteIdentifierSchema>;