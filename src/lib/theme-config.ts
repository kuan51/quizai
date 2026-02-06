export const THEMES = [
  { id: "editorial", label: "Editorial", category: "Editorial", dark: false },
  { id: "editorial-dark", label: "Editorial Dark", category: "Editorial", dark: true },
  { id: "editorial-neon", label: "Editorial Neon", category: "Editorial", dark: true },
  { id: "cyberpunk-light", label: "Cyberpunk Light", category: "Cyberpunk", dark: false },
  { id: "cyberpunk-dark", label: "Cyberpunk Dark", category: "Cyberpunk", dark: true },
  { id: "cyberpunk-neon", label: "Cyberpunk Neon", category: "Cyberpunk", dark: true },
  { id: "dracula-light", label: "Dracula Light", category: "Dracula", dark: false },
  { id: "dracula-dark", label: "Dracula Dark", category: "Dracula", dark: true },
  { id: "dracula-neon", label: "Dracula Neon", category: "Dracula", dark: true },
  { id: "arc-light", label: "Arc Light", category: "Arc", dark: false },
  { id: "arc-dark", label: "Arc Dark", category: "Arc", dark: true },
  { id: "arc-neon", label: "Arc Neon", category: "Arc", dark: true },
  { id: "glass-light", label: "Glass Light", category: "Glass", dark: false },
  { id: "glass-dark", label: "Glass Dark", category: "Glass", dark: true },
  { id: "glass-neon", label: "Glass Neon", category: "Glass", dark: true },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

const VALID_IDS = new Set<string>(THEMES.map((t) => t.id));

export function isValidTheme(id: string): id is ThemeId {
  return VALID_IDS.has(id);
}

export function getTheme(id: ThemeId) {
  return THEMES.find((t) => t.id === id)!;
}

export function getThemesByCategory() {
  const grouped: Record<string, typeof THEMES[number][]> = {};
  for (const theme of THEMES) {
    (grouped[theme.category] ??= []).push(theme);
  }
  return grouped;
}

export const STORAGE_KEY = "quizai-theme";
