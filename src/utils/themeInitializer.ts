// Theme initializer to ensure themes are applied immediately on page load
export const initializeTheme = () => {
  // Get saved preferences from localStorage with validation
  // Aggressively clean all whitespace/newlines
  let savedTheme = (localStorage.getItem('theme') || 'dark').replace(/[\s\n\r\t]/g, '');
  let savedColorTheme = (localStorage.getItem('colorTheme') || 'blue').replace(/[\s\n\r\t]/g, '');
  const savedLanguage = (localStorage.getItem('language') || 'en').replace(/[\s\n\r\t]/g, '');
  const savedFontSize = (localStorage.getItem('fontSize') || '16').replace(/[\s\n\r\t]/g, '');

  // Validate theme values - filter out corrupted/stringified function values
  const validThemes = ['light', 'dark'];
  const validColorThemes = ['blue', 'grey', 'red', 'yellow', 'green'];
  
  if (!validThemes.includes(savedTheme)) {
    savedTheme = 'dark';
    localStorage.removeItem('theme'); // Clear corrupted value
  }
  
  if (!validColorThemes.includes(savedColorTheme)) {
    savedColorTheme = 'blue';
    localStorage.removeItem('colorTheme'); // Clear corrupted value
  }

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