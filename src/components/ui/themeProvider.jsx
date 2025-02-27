import React, { createContext, useContext, useEffect, useState } from "react";

// Create theme context
const ThemeContext = createContext({
  theme: "dark",
  setTheme: () => null,
});

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Check for user preference or stored theme
  const [theme, setTheme] = useState(() => {
    // Check local storage first
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      return storedTheme;
    }
    // Check user preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light"; // Default theme
  });

  useEffect(() => {
    // Update the document class for theme
    const root = window.document.documentElement;
    
    // Remove both classes first
    root.classList.remove("light", "dark");
    
    // Add the current theme class
    root.classList.add(theme);
    
    // Store the theme preference
    localStorage.setItem("theme", theme);
  }, [theme]);

  const value = {
    theme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};