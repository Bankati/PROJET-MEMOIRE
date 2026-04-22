"use client";
import * as React from "react";
import { Moon, Sun } from "lucide-react";

interface ThemeSwitchProps {
  className?: string;
}

const applyTheme = ({
  theme,
}: Readonly<{
  theme: "light" | "dark";
}>): void => {
  document.documentElement.classList.toggle("dark", theme === "dark");
};

export function ThemeSwitch({ className = "" }: ThemeSwitchProps): React.JSX.Element {
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  React.useEffect((): void => {
    const savedTheme: string =
      localStorage.getItem("theme") ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const safeTheme: "light" | "dark" = savedTheme === "dark" ? "dark" : "light";
    setTheme(safeTheme);
    applyTheme({ theme: safeTheme });
  }, []);
  const toggleTheme = React.useCallback((): void => {
    const newTheme: "light" | "dark" = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme({ theme: newTheme });
  }, [theme]);
  return (
    <button
      onClick={toggleTheme}
      className={`relative flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 transition-opacity hover:opacity-80 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 ${className}`}
      aria-label="Changer le thème"
      type="button"
    >
      <Sun
        className={`absolute h-5 w-5 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          theme === "light" ? "translate-y-0 scale-100 opacity-100" : "translate-y-5 scale-50 opacity-0"
        }`}
      />
      <Moon
        className={`absolute h-5 w-5 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          theme === "dark" ? "translate-y-0 scale-100 opacity-100" : "translate-y-5 scale-50 opacity-0"
        }`}
      />
    </button>
  );
}

export function ThemeSwitchDemo(): React.JSX.Element {
  return (
    <div className="flex items-center justify-center py-8">
      <ThemeSwitch />
    </div>
  );
}
