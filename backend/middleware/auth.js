const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user details from database
        const userResult = await query(
            'SELECT id, name, email, role FROM users WHERE id = $1',
            [decoded.userId]
        );
        
        if (userResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Add user info to request
        req.user = userResult.rows[0];
        next();
        
    } catch (error) {
        console.error('Auth middleware error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
};

// Middleware to check user roles
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }
        
        next();
    };
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    return authorizeRoles('system_admin')(req, res, next);
};

// Middleware to check if user is store owner or admin
const requireStoreOwnerOrAdmin = (req, res, next) => {
    return authorizeRoles('store_owner', 'system_admin')(req, res, next);
};

// Middleware to check if user is normal user or admin
const requireUserOrAdmin = (req, res, next) => {
    return authorizeRoles('normal_user', 'system_admin')(req, res, next);
};

// Middleware to check if user owns the resource or is admin
const requireOwnershipOrAdmin = (resourceField = 'user_id') => {
    return async (req, res, next) => {
        try {
            if (req.user.role === 'system_admin') {
                return next();
            }
            
            // Check if user owns the resource
            const resourceId = req.params.id;
            if (!resourceId) {
                return res.status(400).json({
                    success: false,
                    message: 'Resource ID required'
                });
            }
              if (req.user.id.toString() === resourceId) {
                return next();
            }
            
            return res.status(403).json({
                success: false,
                message: 'Access denied: You can only access your own resources'
            });
            
        } catch (error) {
            console.error('Ownership check error:', error);
            return res.status(500).json({
                success: false,
                message: 'Authorization error'
            });
        }
    };
};

// Middleware to check if store owner can access specific store
const requireStoreOwnership = async (req, res, next) => {
    try {
        if (req.user.role === 'system_admin') {
            return next();
        }
        
        if (req.user.role !== 'store_owner') {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Store owner access required'
            });
        }
        
        const storeId = req.params.storeId || req.body.storeId;
        if (!storeId) {
            return res.status(400).json({
                success: false,
                message: 'Store ID required'
            });
        }
        
        // Check if user owns this store
        const storeResult = await query(
            'SELECT owner_id FROM stores WHERE id = $1',
            [storeId]
        );
        
        if (storeResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }
        
        if (storeResult.rows[0].owner_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: You can only access your own store'
            });
        }
        
        next();
        
    } catch (error) {
        console.error('Store ownership check error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authorization error'
        });
    }
};

module.exports = {
    authenticateToken,
    authorizeRoles,
    requireAdmin,
    requireStoreOwnerOrAdmin,
    requireUserOrAdmin,
    requireOwnershipOrAdmin,
    requireStoreOwnership
};