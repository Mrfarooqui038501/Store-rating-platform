// Validation utility functions

// Email validation
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Password validation (8-16 characters, at least one uppercase and one special character)
const isValidPassword = (password) => {
    if (!password || password.length < 8 || password.length > 16) {
        return false;
    }
    
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return hasUppercase && hasSpecialChar;
};

// Name validation (20-60 characters)
const isValidName = (name) => {
    if (!name || typeof name !== 'string') {
        return false;
    }
    const trimmed = name.trim();
    return trimmed.length >= 20 && trimmed.length <= 60;
};

// Address validation (max 400 characters)
const isValidAddress = (address) => {
    if (!address || typeof address !== 'string') {
        return false;
    }
    return address.trim().length <= 400;
};

// Rating validation (1-5)
const isValidRating = (rating) => {
    const num = parseInt(rating);
    return !isNaN(num) && num >= 1 && num <= 5;
};

// Role validation
const isValidRole = (role) => {
    const validRoles = ['system_admin', 'normal_user', 'store_owner'];
    return validRoles.includes(role);
};

// Validation middleware
const validateUserRegistration = (req, res, next) => {
    const { name, email, password, address } = req.body;
    const errors = [];
    
    if (!name) {
        errors.push('Name is required');
    } else if (!isValidName(name)) {
        errors.push('Name must be between 20 and 60 characters');
    }
    
    if (!email) {
        errors.push('Email is required');
    } else if (!isValidEmail(email)) {
        errors.push('Please provide a valid email address');
    }
    
    if (!password) {
        errors.push('Password is required');
    } else if (!isValidPassword(password)) {
        errors.push('Password must be 8-16 characters with at least one uppercase letter and one special character');
    }
    
    if (!address) {
        errors.push('Address is required');
    } else if (!isValidAddress(address)) {
        errors.push('Address must not exceed 400 characters');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }
    
    next();
};

const validateUserCreation = (req, res, next) => {
    const { name, email, password, address, role } = req.body;
    const errors = [];
    
    if (!name) {
        errors.push('Name is required');
    } else if (!isValidName(name)) {
        errors.push('Name must be between 20 and 60 characters');
    }
    
    if (!email) {
        errors.push('Email is required');
    } else if (!isValidEmail(email)) {
        errors.push('Please provide a valid email address');
    }
    
    if (!password) {
        errors.push('Password is required');
    } else if (!isValidPassword(password)) {
        errors.push('Password must be 8-16 characters with at least one uppercase letter and one special character');
    }
    
    if (!address) {
        errors.push('Address is required');
    } else if (!isValidAddress(address)) {
        errors.push('Address must not exceed 400 characters');
    }
    
    if (role && !isValidRole(role)) {
        errors.push('Invalid role specified');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }
    
    next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];
    
    if (!email) {
        errors.push('Email is required');
    } else if (!isValidEmail(email)) {
        errors.push('Please provide a valid email address');
    }
    
    if (!password) {
        errors.push('Password is required');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }
    
    next();
};

const validatePasswordUpdate = (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    const errors = [];
    
    if (!currentPassword) {
        errors.push('Current password is required');
    }
    
    if (!newPassword) {
        errors.push('New password is required');
    } else if (!isValidPassword(newPassword)) {
        errors.push('New password must be 8-16 characters with at least one uppercase letter and one special character');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }
    
    next();
};

const validateStoreCreation = (req, res, next) => {
    const { name, email, address, owner_id } = req.body;
    const errors = [];
    
    if (!name) {
        errors.push('Store name is required');
    } else if (!isValidName(name)) {
        errors.push('Store name must be between 20 and 60 characters');
    }
    
    if (!email) {
        errors.push('Store email is required');
    } else if (!isValidEmail(email)) {
        errors.push('Please provide a valid email address');
    }
    
    if (!address) {
        errors.push('Store address is required');
    } else if (!isValidAddress(address)) {
        errors.push('Address must not exceed 400 characters');
    }
    
    if (!owner_id) {
        errors.push('Store owner is required');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }
    
    next();
};

const validateRating = (req, res, next) => {
    const { store_id, rating } = req.body;
    const errors = [];
    
    if (!store_id) {
        errors.push('Store ID is required');
    }
    
    if (!rating) {
        errors.push('Rating is required');
    } else if (!isValidRating(rating)) {
        errors.push('Rating must be between 1 and 5');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }
    
    next();
};

// Search and filter validation
const validateSearchParams = (req, res, next) => {
    const { name, email, address, role, sortBy, sortOrder } = req.query;
    
    if (role && !isValidRole(role)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid role specified'
        });
    }
    
    if (sortOrder && !['asc', 'desc'].includes(sortOrder.toLowerCase())) {
        return res.status(400).json({
            success: false,
            message: 'Sort order must be either "asc" or "desc"'
        });
    }
    
    // Clean and validate search terms
    if (name) req.query.name = name.trim();
    if (email) req.query.email = email.trim();
    if (address) req.query.address = address.trim();
    
    next();
};

module.exports = {
    isValidEmail,
    isValidPassword,
    isValidName,
    isValidAddress,
    isValidRating,
    isValidRole,
    validateUserRegistration,
    validateUserCreation,
    validateLogin,
    validatePasswordUpdate,
    validateStoreCreation,
    validateRating,
    validateSearchParams
};