// Theme initializer to ensure themes are applied immediately on page load
export const initializeTheme = () => {
  // Get saved preferences from localStorage
  const savedTheme = localStorage.getItem('theme') || 'dark';
  const savedColorTheme = localStorage.getItem('colorTheme') || 'blue';
  const savedLanguage = localStorage.getItem('language') || 'en';
  const savedFontSize = localStorage.getItem('fontSize') || '16';

  // Apply theme classes immediately to prevent flash
  const root = document.documentElement;
  
  // Remove all theme classes first
  root.classList.remove('light', 'dark', 'blue', 'grey', 'red', 'yellow', 'green');
  root.classList.remove('en', 'hi', 'pa', 'ur', 'bn', 'ta', 'te', 'ml', 'kn', 'gu', 'mr');
  
  // Apply saved theme
  root.classList.add(savedTheme);
  root.classList.add(savedColorTheme);
  
  // Apply language to body
  document.documentElement.lang = savedLanguage;
  document.body.classList.add(savedLanguage);
  
  // Apply font size
  root.style.fontSize = `${savedFontSize}px`;
  
  return {
    theme: savedTheme,
    colorTheme: savedColorTheme,
    language: savedLanguage,
    fontSize: parseInt(savedFontSize)
  };
};

// Call immediately when script loads
if (typeof window !== 'undefined') {
  initializeTheme();
}