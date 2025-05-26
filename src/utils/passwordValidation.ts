export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PasswordValidationOptions {
  minLength?: number;
  requireUppercase?: boolean;
  requireNumber?: boolean;
  requireSpecialChar?: boolean;
}

export interface PasswordValidationMessages {
  tooShort: string;
  missingUppercase: string;
  missingNumber: string;
  missingSpecialChar: string;
}

export const validatePassword = (
  password: string,
  options: PasswordValidationOptions = {}
): PasswordValidationResult => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireNumber = true,
    requireSpecialChar = true,
  } = options;

  const errors: string[] = [];

  // Check minimum length
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }

  // Check for uppercase letter
  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for number
  if (requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check for special character
  if (requireSpecialChar && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePasswordWithMessages = (
  password: string,
  messages: PasswordValidationMessages,
  options: PasswordValidationOptions = {}
): PasswordValidationResult => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireNumber = true,
    requireSpecialChar = true,
  } = options;

  const errors: string[] = [];

  // Check minimum length
  if (password.length < minLength) {
    errors.push(messages.tooShort);
  }

  // Check for uppercase letter
  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push(messages.missingUppercase);
  }

  // Check for number
  if (requireNumber && !/\d/.test(password)) {
    errors.push(messages.missingNumber);
  }

  // Check for special character
  if (requireSpecialChar && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push(messages.missingSpecialChar);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  const validation = validatePassword(password);
  
  if (!validation.isValid) {
    return 'weak';
  }

  let score = 0;
  
  // Length bonus
  if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;
  
  // Character variety bonus
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  
  if (score >= 5) return 'strong';
  if (score >= 3) return 'medium';
  return 'weak';
}; 