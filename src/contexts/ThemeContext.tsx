"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { type ThemeId, THEMES, isValidTheme, STORAGE_KEY } from "@/lib/theme-config";

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyTheme(id: ThemeId) {
  const el = document.documentElement;
  const meta = THEMES.find((t) => t.id === id)!;

  if (id === "editorial") {
    delete el.dataset.theme;
    localStorage.removeItem(STORAGE_KEY);
  } else {
    el.dataset.theme = id;
    localStorage.setItem(STORAGE_KEY, id);
  }

  el.classList.toggle("dark", meta.dark);
  el.style.colorScheme = meta.dark ? "dark" : "light";
}

function readStoredTheme(): ThemeId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isValidTheme(stored)) return stored;
  } catch {
    // localStorage unavailable (SSR, privacy mode)
  }
  return "editorial";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("editorial");

  useEffect(() => {
    const initial = readStoredTheme();
    setThemeState(initial);
    applyTheme(initial);
  }, []);

  const setTheme = useCallback((id: ThemeId) => {
    setThemeState(id);
    applyTheme(id);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
