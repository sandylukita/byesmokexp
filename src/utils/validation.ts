/**
 * Security validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Email validation with comprehensive regex
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email is required');
    return { isValid: false, errors };
  }
  
  if (email.length > 254) {
    errors.push('Email must be less than 254 characters');
  }
  
  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    errors.push('Invalid email format');
  }
  
  // Check for common malicious patterns
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /data:text\/html/i
  ];
  
  if (maliciousPatterns.some(pattern => pattern.test(email))) {
    errors.push('Email contains invalid characters');
  }
  
  return { isValid: errors.length === 0, errors };
};

// Password validation with security requirements
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check for common weak passwords
  const weakPasswords = [
    'password', '123456789', 'qwerty', 'abc123', 'password123',
    '123456', '12345678', '111111', '1234567890'
  ];
  
  if (weakPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common and easily guessable');
  }
  
  return { isValid: errors.length === 0, errors };
};

// Display name validation
export const validateDisplayName = (displayName: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!displayName) {
    errors.push('Display name is required');
    return { isValid: false, errors };
  }
  
  // Length validation
  if (displayName.length < 2) {
    errors.push('Display name must be at least 2 characters long');
  }
  
  if (displayName.length > 50) {
    errors.push('Display name must be less than 50 characters');
  }
  
  // Character validation - allow letters, numbers, spaces, and common punctuation
  const allowedCharsRegex = /^[a-zA-Z0-9\s\-_.,']+$/;
  if (!allowedCharsRegex.test(displayName)) {
    errors.push('Display name contains invalid characters');
  }
  
  // Check for XSS patterns
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /<\/?\w+/i,
    /&lt;/i,
    /&gt;/i
  ];
  
  if (xssPatterns.some(pattern => pattern.test(displayName))) {
    errors.push('Display name contains forbidden characters');
  }
  
  // Check for excessive whitespace
  if (displayName.trim() !== displayName) {
    errors.push('Display name cannot start or end with whitespace');
  }
  
  if (/\s{2,}/.test(displayName)) {
    errors.push('Display name cannot contain multiple consecutive spaces');
  }
  
  return { isValid: errors.length === 0, errors };
};

// Username validation
export const validateUsername = (username: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!username) {
    errors.push('Username is required');
    return { isValid: false, errors };
  }
  
  // Length validation
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  
  if (username.length > 30) {
    errors.push('Username must be less than 30 characters');
  }
  
  // Character validation - alphanumeric, underscores, and hyphens only
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens');
  }
  
  // Must start with a letter or number
  if (!/^[a-zA-Z0-9]/.test(username)) {
    errors.push('Username must start with a letter or number');
  }
  
  // Must end with a letter or number
  if (!/[a-zA-Z0-9]$/.test(username)) {
    errors.push('Username must end with a letter or number');
  }
  
  // Check for reserved usernames
  const reservedUsernames = [
    'admin', 'root', 'user', 'test', 'guest', 'api', 'www', 'mail',
    'support', 'help', 'info', 'contact', 'service', 'system', 'null',
    'undefined', 'anonymous', 'public', 'private', 'server'
  ];
  
  if (reservedUsernames.includes(username.toLowerCase())) {
    errors.push('Username is reserved and cannot be used');
  }
  
  return { isValid: errors.length === 0, errors };
};

// Referral code validation
export const validateReferralCode = (referralCode: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!referralCode) {
    return { isValid: true, errors }; // Referral code is optional
  }
  
  // Length validation (typical referral codes are 6-12 characters)
  if (referralCode.length < 4 || referralCode.length > 20) {
    errors.push('Referral code must be between 4 and 20 characters');
  }
  
  // Character validation - alphanumeric only
  const referralCodeRegex = /^[a-zA-Z0-9]+$/;
  if (!referralCodeRegex.test(referralCode)) {
    errors.push('Referral code can only contain letters and numbers');
  }
  
  return { isValid: errors.length === 0, errors };
};

// Comprehensive validation for sign up
export const validateSignUp = (
  email: string,
  password: string,
  confirmPassword: string,
  displayName: string,
  username: string
): ValidationResult => {
  const errors: string[] = [];
  
  // Individual validations
  const emailResult = validateEmail(email);
  const passwordResult = validatePassword(password);
  const displayNameResult = validateDisplayName(displayName);
  const usernameResult = validateUsername(username);
  
  // Collect all errors
  errors.push(...emailResult.errors);
  errors.push(...passwordResult.errors);
  errors.push(...displayNameResult.errors);
  errors.push(...usernameResult.errors);
  
  // Password confirmation validation
  if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }
  
  return { isValid: errors.length === 0, errors };
};

// Validation for sign in
export const validateSignIn = (email: string, password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email is required');
  } else {
    const emailResult = validateEmail(email);
    errors.push(...emailResult.errors);
  }
  
  if (!password) {
    errors.push('Password is required');
  }
  
  return { isValid: errors.length === 0, errors };
};

// Sanitization functions
export const sanitizeDisplayName = (displayName: string): string => {
  return displayName
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .substring(0, 50); // Truncate to max length
};

export const sanitizeUsername = (username: string): string => {
  return username
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9_-]/g, '') // Remove invalid characters
    .substring(0, 30); // Truncate to max length
};

export const sanitizeEmail = (email: string): string => {
  return email
    .trim()
    .toLowerCase()
    .substring(0, 254); // Truncate to max length
};