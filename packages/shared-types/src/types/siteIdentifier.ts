export type SiteIdentifier = |{
    kind: "domain";
    displayName: string;
    normalizedDomain: string;
    generationLabel?: never;
}|{
    kind: "label";
    displayName: string;
    generationLabel: string;
    normalizedDomain?: never;
};