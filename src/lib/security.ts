export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain lowercase letter');
  if (!/\d/.test(password)) errors.push('Password must contain a number');
  if (!/[!@#$%^&*]/.test(password)) errors.push('Password must contain special character');
  
  return { isValid: errors.length === 0, errors };
};

export const rateLimiter = (() => {
  const requests = new Map<string, number[]>();
  
  return (key: string, limit: number = 10, window: number = 60000): boolean => {
    const now = Date.now();
    const userRequests = requests.get(key) || [];
    
    const validRequests = userRequests.filter(time => now - time < window);
    
    if (validRequests.length >= limit) {
      return false;
    }
    
    validRequests.push(now);
    requests.set(key, validRequests);
    
    return true;
  };
})();

export const generateCSRFToken = (): string => {
  return crypto.getRandomValues(new Uint8Array(32))
    .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
};

export const sanitizeFileName = (fileName: string): string => {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 255);
};

export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

export const validateFileSize = (file: File, maxSizeInMB: number): boolean => {
  return file.size <= maxSizeInMB * 1024 * 1024;
};