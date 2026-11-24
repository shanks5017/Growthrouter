import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'growthrouter-theme';

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialTheme(): Theme {
  if (typeof document !== 'undefined') {
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'light' || attr === 'dark') {
      return attr;
    }
  }
  return 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const transitionTimerRef = useRef<number | null>(null);

  const applyTheme = useCallback((next: Theme, animate = false) => {
    setThemeState(next);
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (animate) {
        root.classList.add('theme-transitioning');
        if (transitionTimerRef.current !== null) {
          window.clearTimeout(transitionTimerRef.current);
        }
        transitionTimerRef.current = window.setTimeout(() => {
          root.classList.remove('theme-transitioning');
          transitionTimerRef.current = null;
        }, 260);
      }
      root.setAttribute('data-theme', next);
    }
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore storage failures in restricted contexts
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    return () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, [theme]);

  const setTheme = useCallback(
    (next: Theme) => applyTheme(next, true),
    [applyTheme]
  );

  const toggleTheme = useCallback(() => {
    applyTheme(theme === 'dark' ? 'light' : 'dark', true);
  }, [applyTheme, theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
