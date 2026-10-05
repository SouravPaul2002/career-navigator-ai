import React from 'react';
import { useTheme } from '../../context/ThemeContext';


const ThemeToggle: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button 
      className="theme-toggle" 
      onClick={toggleDarkMode}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? (
        <i className="bi bi-sun" title="Light mode"></i>
      ) : (
        <i className="bi bi-moon" title="Dark mode"></i>
      )}
    </button>
  );
};

export default ThemeToggle;