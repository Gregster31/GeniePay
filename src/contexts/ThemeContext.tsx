import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeCtxValue {
  isDark: boolean;
  toggle: () => void;
}

const ThemeCtx = createContext<ThemeCtxValue>({ isDark: true, toggle: () => {} });

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  // Apply to <html> so Tailwind dark: variants work everywhere
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark',  isDark);
    root.classList.toggle('light', !isDark);
  }, [isDark]);

  return (
    <ThemeCtx.Provider value={{ isDark, toggle: () => setIsDark(p => !p) }}>
      {children}
    </ThemeCtx.Provider>
  );
};

export const useTheme = () => useContext(ThemeCtx);