// Generate unique 8-10 digit user ID
export const generateUniqueUserId = (): string => {
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0'); // 4 random digits
  return timestamp + random; // 10 digit ID
};

// Generate shorter 8-digit ID
export const generateShortUserId = (): string => {
  const timestamp = Date.now().toString().slice(-4); // Last 4 digits of timestamp
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0'); // 4 random digits
  return timestamp + random; // 8 digit ID
};

// Validate user ID format
export const isValidUserId = (id: string): boolean => {
  return /^\d{8,10}$/.test(id);
};