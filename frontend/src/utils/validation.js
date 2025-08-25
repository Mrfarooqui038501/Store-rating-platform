export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


export const isValidPassword = (password) => {
  if (!password || password.length < 8 || password.length > 16) {
    return false;
  }
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  return hasUppercase && hasSpecialChar;
};


export const isValidName = (name) => {
  if (!name || typeof name !== 'string') {
    return false;
  }
  const trimmed = name.trim();
  return trimmed.length >= 20 && trimmed.length <= 60;
};


export const isValidAddress = (address) => {
  if (!address || typeof address !== 'string') {
    return false;
  }
  return address.trim().length <= 400 && address.trim().length > 0;
};

export const isValidRating = (rating) => {
  const num = parseInt(rating);
  return !isNaN(num) && num >= 1 && num <= 5;
};


export const isValidRole = (role) => {
  const validRoles = ['system_admin', 'normal_user', 'store_owner'];
  return validRoles.includes(role);
};


export const getPasswordStrength = (password) => {
  let strength = 0;
  let feedback = [];

  if (password.length >= 8) strength += 1;
  else feedback.push('At least 8 characters');

  if (password.length <= 16) strength += 1;
  else feedback.push('Maximum 16 characters');

  if (/[A-Z]/.test(password)) strength += 1;
  else feedback.push('At least one uppercase letter');

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 1;
  else feedback.push('At least one special character');

  return {
    score: strength,
    maxScore: 4,
    feedback: feedback,
    isValid: strength === 4
  };
};


export const validateForm = (data, formType) => {
  const errors = {};
  let isValid = true;

  switch (formType) {
    case 'login':
      if (!data.email) {
        errors.email = 'Email is required';
        isValid = false;
      } else if (!isValidEmail(data.email)) {
        errors.email = 'Please enter a valid email address';
        isValid = false;
      }

      if (!data.password) {
        errors.password = 'Password is required';
        isValid = false;
      }
      break;

    case 'register':
      if (!data.name) {
        errors.name = 'Name is required';
        isValid = false;
      } else if (!isValidName(data.name)) {
        errors.name = 'Name must be between 20 and 60 characters';
        isValid = false;
      }

      if (!data.email) {
        errors.email = 'Email is required';
        isValid = false;
      } else if (!isValidEmail(data.email)) {
        errors.email = 'Please enter a valid email address';
        isValid = false;
      }

      if (!data.password) {
        errors.password = 'Password is required';
        isValid = false;
      } else if (!isValidPassword(data.password)) {
        errors.password = 'Password must be 8-16 characters with at least one uppercase letter and one special character';
        isValid = false;
      }

      if (!data.address) {
        errors.address = 'Address is required';
        isValid = false;
      } else if (!isValidAddress(data.address)) {
        errors.address = 'Address must not exceed 400 characters';
        isValid = false;
      }
      break;

    case 'passwordUpdate':
      if (!data.currentPassword) {
        errors.currentPassword = 'Current password is required';
        isValid = false;
      }

      if (!data.newPassword) {
        errors.newPassword = 'New password is required';
        isValid = false;
      } else if (!isValidPassword(data.newPassword)) {
        errors.newPassword = 'Password must be 8-16 characters with at least one uppercase letter and one special character';
        isValid = false;
      }

      if (data.confirmPassword !== data.newPassword) {
        errors.confirmPassword = 'Passwords do not match';
        isValid = false;
      }
      break;

    case 'createUser':
      if (!data.name) {
        errors.name = 'Name is required';
        isValid = false;
      } else if (!isValidName(data.name)) {
        errors.name = 'Name must be between 20 and 60 characters';
        isValid = false;
      }

      if (!data.email) {
        errors.email = 'Email is required';
        isValid = false;
      } else if (!isValidEmail(data.email)) {
        errors.email = 'Please enter a valid email address';
        isValid = false;
      }

      if (!data.password) {
        errors.password = 'Password is required';
        isValid = false;
      } else if (!isValidPassword(data.password)) {
        errors.password = 'Password must be 8-16 characters with at least one uppercase letter and one special character';
        isValid = false;
      }

      if (!data.address) {
        errors.address = 'Address is required';
        isValid = false;
      } else if (!isValidAddress(data.address)) {
        errors.address = 'Address must not exceed 400 characters';
        isValid = false;
      }

      if (data.role && !isValidRole(data.role)) {
        errors.role = 'Please select a valid role';
        isValid = false;
      }
      break;

    case 'createStore':
      if (!data.name) {
        errors.name = 'Store name is required';
        isValid = false;
      } else if (!isValidName(data.name)) {
        errors.name = 'Store name must be between 20 and 60 characters';
        isValid = false;
      }

      if (!data.email) {
        errors.email = 'Store email is required';
        isValid = false;
      } else if (!isValidEmail(data.email)) {
        errors.email = 'Please enter a valid email address';
        isValid = false;
      }

      if (!data.address) {
        errors.address = 'Store address is required';
        isValid = false;
      } else if (!isValidAddress(data.address)) {
        errors.address = 'Address must not exceed 400 characters';
        isValid = false;
      }

      if (!data.owner_id) {
        errors.owner_id = 'Store owner is required';
        isValid = false;
      }
      break;

    case 'rating':
      if (!data.rating) {
        errors.rating = 'Rating is required';
        isValid = false;
      } else if (!isValidRating(data.rating)) {
        errors.rating = 'Rating must be between 1 and 5';
        isValid = false;
      }
      break;

    default:
      break;
  }

  return { isValid, errors };
};


export const formatValidationErrors = (errors) => {
  if (Array.isArray(errors)) {
    return errors.join(', ');
  }
  
  if (typeof errors === 'object') {
    return Object.values(errors).join(', ');
  }
  
  return errors || 'Validation failed';
};

export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};


export const getCharacterCount = (text, maxLength) => {
  const length = text ? text.length : 0;
  return {
    current: length,
    max: maxLength,
    remaining: maxLength - length,
    isOverLimit: length > maxLength,
    percentage: (length / maxLength) * 100
  };
};