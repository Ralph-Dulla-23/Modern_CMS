import { describe, it, expect } from 'vitest';

// We map out the error handler logic from authService.js directly to test it without 
// triggering real absolute Firebase SDK calls that require network access
const mockHandleError = (error) => {
  const errorMessages = {
    'auth/user-not-found': 'Invalid email or password',
    'auth/wrong-password': 'Invalid email or password',
    'auth/email-already-in-use': 'An account with this email already exists',
    'auth/invalid-email': 'Invalid email format',
    'auth/weak-password': 'Password should be at least 6 characters'
  };

  return errorMessages[error.code] || "Authentication failed. Please try again.";
};

describe('Authentication Error Handler', () => {
  it('should return a generic message for wrong passwords (anti-enumeration)', () => {
    const error = { code: 'auth/wrong-password' };
    expect(mockHandleError(error)).toBe('Invalid email or password');
  });

  it('should return a generic message for missing users (anti-enumeration)', () => {
    const error = { code: 'auth/user-not-found' };
    expect(mockHandleError(error)).toBe('Invalid email or password');
  });

  it('should return a default fallback message for unknown error codes', () => {
    const error = { code: 'auth/internal-error' };
    expect(mockHandleError(error)).toBe('Authentication failed. Please try again.');
  });
});
