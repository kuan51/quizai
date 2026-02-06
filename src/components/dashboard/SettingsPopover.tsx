"use client";

import { useState, useRef, useEffect } from "react";
import { Settings, Check, ChevronDown } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { type ThemeId, getThemesByCategory, THEMES } from "@/lib/theme-config";

const THEME_PREVIEW_COLORS: Record<ThemeId, { bg: string; accent: string }> = {
  editorial: { bg: "#faf8f6", accent: "#7b4f94" },
  "editorial-dark": { bg: "#100d0a", accent: "#b08cc8" },
  "editorial-neon": { bg: "#1e1420", accent: "#ec4899" },
  "cyberpunk-light": { bg: "#dce0ea", accent: "#0891b2" },
  "cyberpunk-dark": { bg: "#07070d", accent: "#00ffff" },
  "cyberpunk-neon": { bg: "#0d0d28", accent: "#ff00ff" },
  "dracula-light": { bg: "#f8f8f2", accent: "#bd93f9" },
  "dracula-dark": { bg: "#282a36", accent: "#bd93f9" },
  "dracula-neon": { bg: "#1c1430", accent: "#bd93f9" },
  "arc-light": { bg: "#f5f6f7", accent: "#5294e2" },
  "arc-dark": { bg: "#2b303b", accent: "#5294e2" },
  "arc-neon": { bg: "#0e1a2e", accent: "#38bdf8" },
  "glass-light": { bg: "#f0f0f5", accent: "#3b82f6" },
  "glass-dark": { bg: "#0f1115", accent: "#60a5fa" },
  "glass-neon": { bg: "#0a1a1e", accent: "#00fff2" },
};

export function SettingsPopover({ isCollapsed }: { isCollapsed: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const categories = getThemesByCategory();
  const currentTheme = THEMES.find((t) => t.id === theme);

  return (
    <div className="relative">
      {/* Settings Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 p-3 rounded-lg w-full transition-colors ${
          isOpen
            ? "bg-white/10 text-[var(--sidebar-text-active)]"
            : "text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-hover)] hover:bg-white/5"
        }`}
        title="Settings"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Settings size={20} />
        {!isCollapsed && (
          <span className="transition-opacity duration-200">
            Settings
          </span>
        )}
      </button>

      {/* Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="Appearance settings"
          className="absolute bottom-full left-0 mb-2 w-64 rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-editorial animate-scale-in origin-bottom-left z-50"
          style={{
            backdropFilter: `blur(var(--backdrop-blur, 0px))`,
            WebkitBackdropFilter: `blur(var(--backdrop-blur, 0px))`,
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Appearance
            </h3>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
              {currentTheme?.label ?? "Editorial"}
            </p>
          </div>

          {/* Theme Categories */}
          <div className="py-1.5 max-h-72 overflow-y-auto">
            {Object.entries(categories).map(([category, themes]) => (
              <div key={category}>
                {/* Category header — clickable to expand/collapse */}
                <button
                  onClick={() =>
                    setExpandedCategory(
                      expandedCategory === category ? null : category
                    )
                  }
                  className="w-full flex items-center justify-between px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  {category}
                  <ChevronDown
                    size={12}
                    className={`transition-transform duration-200 ${
                      expandedCategory === category ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Theme options — show all for Editorial, expand/collapse others */}
                {(category === "Editorial" || expandedCategory === category) && (
                  <div className="pb-1">
                    {themes.map((t) => {
                      const colors = THEME_PREVIEW_COLORS[t.id];
                      const isActive = theme === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            setTheme(t.id);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                            isActive
                              ? "text-[var(--text-primary)] bg-[var(--surface-elevated)]"
                              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]"
                          }`}
                        >
                          {/* Color preview swatch */}
                          <span
                            className="flex-shrink-0 w-4 h-4 rounded-full border border-[var(--border)]"
                            style={{
                              background: `linear-gradient(135deg, ${colors.bg} 50%, ${colors.accent} 50%)`,
                            }}
                          />
                          <span className="flex-1 text-left truncate">
                            {t.label}
                          </span>
                          {isActive && (
                            <Check
                              size={14}
                              className="flex-shrink-0 text-[var(--ring)]"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
