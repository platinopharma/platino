import { useEffect } from "react";
import { useUIStore } from "@/stores/ui-store";

export function ThemeSync() {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    useUIStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
  }, [theme]);

  return null;
}

