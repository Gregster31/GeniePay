import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeCtxValue {
  isDark: boolean;
  toggle: () => void;
}

const ThemeCtx = createContext<ThemeCtxValue>({ isDark: false, toggle: () => {} });

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

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