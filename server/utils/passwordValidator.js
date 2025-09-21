const PasswordValidator = require('password-validator');

// Create a password schema
const passwordSchema = new PasswordValidator();

// Add properties to it
passwordSchema
  .is().min(8)                                    // Minimum length 8
  .is().max(100)                                  // Maximum length 100
  .has().uppercase()                              // Must have uppercase letters
  .has().lowercase()                              // Must have lowercase letters
  .has().digits(1)                                // Must have at least 1 digit
  .has().not().spaces()                           // Should not have spaces
  .has().symbols(1)                               // Must have at least 1 symbol
  .is().not().oneOf(['Password123!', 'password123!', 'Password123', 'password123']); // Blacklist common passwords

// Custom validation function
const validatePassword = (password) => {
  const errors = passwordSchema.validate(password, { details: true });
  
  if (errors.length === 0) {
    return { isValid: true, errors: [] };
  }
  
  const errorMessages = errors.map(error => {
    switch (error) {
      case 'min':
        return 'Password must be at least 8 characters long';
      case 'max':
        return 'Password must be no more than 100 characters long';
      case 'uppercase':
        return 'Password must contain at least one uppercase letter';
      case 'lowercase':
        return 'Password must contain at least one lowercase letter';
      case 'digits':
        return 'Password must contain at least one digit';
      case 'spaces':
        return 'Password should not contain spaces';
      case 'symbols':
        return 'Password must contain at least one special character';
      case 'oneOf':
        return 'Password is too common, please choose a more secure password';
      default:
        return 'Password does not meet security requirements';
    }
  });
  
  return { isValid: false, errors: errorMessages };
};

// Password strength checker
const getPasswordStrength = (password) => {
  let score = 0;
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    digits: /\d/.test(password),
    symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    noSpaces: !/\s/.test(password)
  };
  
  score = Object.values(checks).filter(Boolean).length;
  
  let strength = 'weak';
  if (score >= 5) strength = 'strong';
  else if (score >= 3) strength = 'medium';
  
  return { score, strength, checks };
};

module.exports = {
  passwordSchema,
  validatePassword,
  getPasswordStrength
};
