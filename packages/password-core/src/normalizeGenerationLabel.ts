export function normalizeGenerationLabel(label: string): string {
  const normalized = label.trim().toLowerCase().replace(/\s+/g, "-");

  if (!normalized) {
    throw new Error("Generation label cannot be empty");
  }

  return normalized;
}
