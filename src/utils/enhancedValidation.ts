export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_RE = /^\+?[1-9]\d{1,14}$/;
export const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export const NAME_RE = /^[a-zA-Z\s]{2,50}$/;
export const PRODUCT_NAME_RE = /^[a-zA-Z0-9\s\-_]{2,100}$/;
export const PRICE_RE = /^\d+(\.\d{1,2})?$/;
export const QUANTITY_RE = /^\d+$/;

// Enhanced validation functions with detailed error messages
export function validateEmail(email: string): { isValid: boolean; message: string } {
  if (!email.trim()) {
    return { isValid: false, message: 'Email is required' };
  }
  if (!EMAIL_RE.test(email.trim())) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  if (email.length > 254) {
    return { isValid: false, message: 'Email address is too long' };
  }
  return { isValid: true, message: '' };
}

export function validatePhone(phone: string): { isValid: boolean; message: string } {
  if (!phone.trim()) {
    return { isValid: false, message: 'Phone number is required' };
  }
  if (!PHONE_RE.test(phone.replace(/\s/g, ''))) {
    return { isValid: false, message: 'Please enter a valid phone number (e.g., +251911234567)' };
  }
  return { isValid: true, message: '' };
}

export function validatePassword(password: string): { isValid: boolean; message: string } {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!PASSWORD_RE.test(password)) {
    return { isValid: false, message: 'Password must contain uppercase, lowercase, number, and special character' };
  }
  return { isValid: true, message: '' };
}

export function validateName(name: string, fieldName: string = 'Name'): { isValid: boolean; message: string } {
  if (!name.trim()) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  if (name.length < 2) {
    return { isValid: false, message: `${fieldName} must be at least 2 characters long` };
  }
  if (name.length > 50) {
    return { isValid: false, message: `${fieldName} is too long (max 50 characters)` };
  }
  if (!NAME_RE.test(name.trim())) {
    return { isValid: false, message: `${fieldName} can only contain letters and spaces` };
  }
  return { isValid: true, message: '' };
}

export function validateProductName(name: string): { isValid: boolean; message: string } {
  if (!name.trim()) {
    return { isValid: false, message: 'Product name is required' };
  }
  if (name.length < 2) {
    return { isValid: false, message: 'Product name must be at least 2 characters long' };
  }
  if (name.length > 100) {
    return { isValid: false, message: 'Product name is too long (max 100 characters)' };
  }
  if (!PRODUCT_NAME_RE.test(name.trim())) {
    return { isValid: false, message: 'Product name can only contain letters, numbers, spaces, hyphens, and underscores' };
  }
  return { isValid: true, message: '' };
}

export function validatePrice(price: string): { isValid: boolean; message: string } {
  if (!price.trim()) {
    return { isValid: false, message: 'Price is required' };
  }
  if (!PRICE_RE.test(price)) {
    return { isValid: false, message: 'Please enter a valid price (e.g., 100.50)' };
  }
  const priceNum = parseFloat(price);
  if (priceNum <= 0) {
    return { isValid: false, message: 'Price must be greater than 0' };
  }
  if (priceNum > 999999) {
    return { isValid: false, message: 'Price is too high' };
  }
  return { isValid: true, message: '' };
}

export function validateQuantity(quantity: string): { isValid: boolean; message: string } {
  if (!quantity.trim()) {
    return { isValid: false, message: 'Quantity is required' };
  }
  if (!QUANTITY_RE.test(quantity)) {
    return { isValid: false, message: 'Please enter a valid quantity' };
  }
  const qty = parseInt(quantity);
  if (qty <= 0) {
    return { isValid: false, message: 'Quantity must be greater than 0' };
  }
  if (qty > 10000) {
    return { isValid: false, message: 'Quantity is too high' };
  }
  return { isValid: true, message: '' };
}

export function validateRequired(value: string, fieldName: string): { isValid: boolean; message: string } {
  if (!value || !value.trim()) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  return { isValid: true, message: '' };
}

export function validateMaxLength(value: string, maxLength: number, fieldName: string): { isValid: boolean; message: string } {
  if (value.length > maxLength) {
    return { isValid: false, message: `${fieldName} is too long (max ${maxLength} characters)` };
  }
  return { isValid: true, message: '' };
}

export function validateMinLength(value: string, minLength: number, fieldName: string): { isValid: boolean; message: string } {
  if (value.length < minLength) {
    return { isValid: false, message: `${fieldName} must be at least ${minLength} characters long` };
  }
  return { isValid: true, message: '' };
}

// Form validation helper
export function validateForm(fields: Record<string, string>, rules: Record<string, (value: string) => { isValid: boolean; message: string }>): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  let isValid = true;

  for (const [fieldName, value] of Object.entries(fields)) {
    const rule = rules[fieldName];
    if (rule) {
      const result = rule(value);
      if (!result.isValid) {
        errors[fieldName] = result.message;
        isValid = false;
      }
    }
  }

  return { isValid, errors };
}
