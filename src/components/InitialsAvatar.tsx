import React from 'react';
import { cn } from '@/lib/utils';

interface InitialsAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  seed?: string;
}

export const InitialsAvatar: React.FC<InitialsAvatarProps> = ({
  name,
  size = 'md',
  className,
  seed
}) => {
  // Get initials from name
  const initials = name
    .split(' ')
    .map(n => n[0]?.toUpperCase())
    .join('')
    .slice(0, 2);

  // Theme color combinations
  const themes = [
    { bg: 'from-blue-500 to-blue-600', text: 'text-blue-100' },
    { bg: 'from-green-500 to-green-600', text: 'text-green-100' },
    { bg: 'from-red-500 to-red-600', text: 'text-red-100' },
    { bg: 'from-yellow-500 to-yellow-600', text: 'text-yellow-100' },
    { bg: 'from-purple-500 to-purple-600', text: 'text-purple-100' },
    { bg: 'from-pink-500 to-pink-600', text: 'text-pink-100' },
    { bg: 'from-indigo-500 to-indigo-600', text: 'text-indigo-100' },
    { bg: 'from-cyan-500 to-cyan-600', text: 'text-cyan-100' },
  ];

  // Deterministic color selection based on name or seed
  const hashStr = seed || name;
  let hash = 0;
  for (let i = 0; i < hashStr.length; i++) {
    hash = ((hash << 5) - hash) + hashStr.charCodeAt(i);
    hash = hash & hash;
  }
  const themeIndex = Math.abs(hash) % themes.length;
  const theme = themes[themeIndex];

  // Size mapping
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-2xl'
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-bold',
        `bg-gradient-to-br ${theme.bg}`,
        theme.text,
        sizeClasses[size],
        className
      )}
      title={name}
    >
      {initials || '?'}
    </div>
  );
};

export default InitialsAvatar;
