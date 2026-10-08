import { useLayoutEffect, useState } from 'react';
import ThemeContext from './theme-context';

const STORAGE_KEY = 'docvia-theme';

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem(STORAGE_KEY);
  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem(STORAGE_KEY, theme);

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.setAttribute('content', theme === 'dark' ? '#09120f' : '#f5f2ea');
  }, [theme]);

  const toggleTheme = () => setTheme((currentTheme) => currentTheme === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
