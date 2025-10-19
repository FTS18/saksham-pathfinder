import React, { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Palette } from 'lucide-react';

export const ThemeSwitcher = () => {
  const { theme, toggleTheme, currentPreset, setPreset, useSystemTheme, setUseSystemTheme, getAvailablePresets } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const availablePresets = getAvailablePresets();

  return (
    <div className="flex items-center gap-2">
      {/* Quick toggle button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="w-10 h-10 p-0"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5" />
        )}
      </Button>

      {/* Theme preset dropdown */}
      <DropdownMenu>
        <button
          className="w-10 h-10 p-2 rounded-md hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center"
          title="Select theme preset"
        >
          <Palette className="w-5 h-5" />
        </button>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Theme Presets</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* System theme option */}
          <DropdownMenuCheckboxItem
            checked={useSystemTheme}
            onCheckedChange={setUseSystemTheme}
            className="flex items-center justify-between"
          >
            <span>Use System Theme</span>
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />

          {/* Theme presets */}
          {availablePresets.map((preset) => (
            <DropdownMenuCheckboxItem
              key={preset.id}
              checked={currentPreset === preset.id && !useSystemTheme}
              onCheckedChange={() => {
                if (useSystemTheme) setUseSystemTheme(false);
                setPreset(preset.id as any);
              }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span>{preset.label}</span>
                <div className="flex gap-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: preset.lightMode.primary,
                    }}
                    title="Primary color (light)"
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: preset.lightMode.secondary,
                    }}
                    title="Secondary color (light)"
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: preset.lightMode.accent,
                    }}
                    title="Accent color (light)"
                  />
                </div>
              </div>
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 text-xs text-muted-foreground">
            {availablePresets.find((p) => p.id === currentPreset)?.description}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ThemeSwitcher;
