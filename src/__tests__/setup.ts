import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Firebase modules so tests don't need a live Firebase project
vi.mock('@/lib/firebase', () => ({
  db: {},
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn(),
  },
  storage: {},
  googleProvider: {},
}));

// Suppress console.error in tests (keeps output clean)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('ReactDOM.render')) return;
    originalError.call(console, ...args);
  };
});
afterAll(() => {
  console.error = originalError;
});
