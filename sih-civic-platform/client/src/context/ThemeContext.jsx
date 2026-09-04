import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Website is permanently dark mode
  const theme = 'dark';
  const [fontSize, setFontSize] = useState(100);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  const increaseFont = () => {
    setFontSize((prev) => Math.min(prev + 10, 130));
  };

  const decreaseFont = () => {
    setFontSize((prev) => Math.max(prev - 10, 90));
  };

  const resetFont = () => {
    setFontSize(100);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        fontSize,
        increaseFont,
        decreaseFont,
        resetFont
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
