import { useTheme } from '@/contexts/ThemeContext';

const SimpleBeams = () => {
  const { theme, colorTheme } = useTheme();
  
  const themeColors = {
    blue: theme === 'dark' ? '#3b82f6' : '#1d4ed8',
    grey: theme === 'dark' ? '#6b7280' : '#374151',
    red: theme === 'dark' ? '#ef4444' : '#dc2626',
    yellow: theme === 'dark' ? '#f59e0b' : '#d97706',
    green: theme === 'dark' ? '#10b981' : '#059669'
  };

  const beamColor = themeColors[colorTheme] || themeColors.blue;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-full w-px animate-pulse"
            style={{
              left: `${15 + i * 15}%`,
              background: `linear-gradient(to bottom, transparent, ${beamColor}, transparent)`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: '3s'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SimpleBeams;