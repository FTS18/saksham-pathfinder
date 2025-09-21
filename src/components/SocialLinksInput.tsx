import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SocialLinksInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  platform: 'portfolio' | 'linkedin' | 'github' | 'twitter' | 'codechef' | 'leetcode';
}

const extractUsername = (input: string, platform: string): string => {
  if (!input.trim()) return '';
  
  // If it's already just a username (no http/https), return as is
  if (!input.includes('http') && !input.includes('.com') && !input.includes('.')) {
    return input.trim();
  }
  
  // Extract username from URL based on platform
  const platformPatterns: Record<string, RegExp> = {
    linkedin: /(?:linkedin\.com\/in\/|linkedin\.com\/pub\/|linkedin\.com\/profile\/view\?id=)([^\/\?&]+)/i,
    github: /(?:github\.com\/)([^\/\?&]+)/i,
    twitter: /(?:twitter\.com\/|x\.com\/)([^\/\?&]+)/i,
    codechef: /(?:codechef\.com\/users\/)([^\/\?&]+)/i,
    leetcode: /(?:leetcode\.com\/)([^\/\?&]+)/i,
    portfolio: /^https?:\/\/(.+)$/i
  };
  
  const pattern = platformPatterns[platform];
  if (pattern) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1].replace(/\/$/, ''); // Remove trailing slash
    }
  }
  
  // If no pattern matches but it's a URL, try to extract domain or path
  if (input.includes('http')) {
    try {
      const url = new URL(input);
      if (platform === 'portfolio') {
        return input; // Keep full URL for portfolio
      }
      // For other platforms, try to extract the path
      const pathParts = url.pathname.split('/').filter(part => part);
      return pathParts[pathParts.length - 1] || input;
    } catch {
      return input;
    }
  }
  
  return input;
};

const getPlatformURL = (username: string, platform: string) => {
  if (!username || username.includes('http')) return username;
  
  const baseURLs: Record<string, string> = {
    linkedin: 'https://linkedin.com/in/',
    github: 'https://github.com/',
    twitter: 'https://twitter.com/',
    codechef: 'https://codechef.com/users/',
    leetcode: 'https://leetcode.com/',
    portfolio: ''
  };
  
  return baseURLs[platform] + username;
};

export const SocialLinksInput = ({ value, onChange, label, placeholder, platform }: SocialLinksInputProps) => {
  const handleChange = (inputValue: string) => {
    const username = extractUsername(inputValue, platform);
    onChange(username);
  };

  const getDisplayValue = () => {
    if (!value) return '';
    
    // If it's already a full URL, show as is
    if (value.includes('http')) return value;
    
    // For portfolio, if it doesn't have protocol, show as is
    if (platform === 'portfolio') return value;
    
    // For other platforms, just show the username
    return value;
  };

  const getPlaceholderText = () => {
    return placeholder;
  };

  return (
    <div>
      <Label>{label}</Label>
      <Input
        value={getDisplayValue()}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={getPlaceholderText()}
      />
      {value && platform !== 'portfolio' && !value.includes('http') && (
        <p className="text-xs text-muted-foreground mt-1">
          Profile: {getPlatformURL(value, platform)}
        </p>
      )}
    </div>
  );
};