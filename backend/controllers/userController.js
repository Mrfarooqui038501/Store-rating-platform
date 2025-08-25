const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
    try {
        const { name, email, address, role, sortBy = 'name', sortOrder = 'asc' } = req.query;
        
        let queryText = `
            SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
                   CASE WHEN u.role = 'store_owner' THEN 
                        (SELECT ROUND(AVG(r.rating)::numeric, 2) 
                         FROM stores s 
                         JOIN ratings r ON s.id = r.store_id 
                         WHERE s.owner_id = u.id)
                   END as rating
            FROM users u
            WHERE 1=1
        `;
        
        const params = [];
        let paramCount = 0;
        
        // Add filters
        if (name) {
            paramCount++;
            queryText += ` AND u.name ILIKE $${paramCount}`;
            params.push(`%${name}%`);
        }
        
        if (email) {
            paramCount++;
            queryText += ` AND u.email ILIKE $${paramCount}`;
            params.push(`%${email}%`);
        }
        
        if (address) {
            paramCount++;
            queryText += ` AND u.address ILIKE $${paramCount}`;
            params.push(`%${address}%`);
        }
        
        if (role) {
            paramCount++;
            queryText += ` AND u.role = $${paramCount}`;
            params.push(role);
        }
        
        // Add sorting
        const validSortFields = ['name', 'email', 'role', 'created_at'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
        const order = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        
        queryText += ` ORDER BY u.${sortField} ${order}`;
        
        const result = await query(queryText, params);
        
        res.json({
            success: true,
            message: 'Users retrieved successfully',
            data: {
                users: result.rows,
                total: result.rows.length
            }
        });
        
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve users'
        });
    }
};

// Get user statistics (Admin only)
const getUserStats = async (req, res) => {
    try {
        const result = await query('SELECT * FROM user_stats_view');
        
        res.json({
            success: true,
            message: 'User statistics retrieved successfully',
            data: result.rows[0]
        });
        
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user statistics'
        });
    }
};

// Create new user (Admin only)
const createUser = async (req, res) => {
    try {
        const { name, email, password, address, role = 'normal_user' } = req.body;
        
        // Check if user already exists
        const existingUser = await query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );
        
        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        
        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Insert user
        const result = await query(
            `INSERT INTO users (name, email, password, address, role) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id, name, email, address, role, created_at`,
            [name, email, hashedPassword, address, role]
        );
        
        const user = result.rows[0];
        
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: { user }
        });
        
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create user'
        });
    }
};

// Get user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await query(
            `SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
                    CASE WHEN u.role = 'store_owner' THEN 
                         (SELECT ROUND(AVG(r.rating)::numeric, 2) 
                          FROM stores s 
                          JOIN ratings r ON s.id = r.store_id 
                          WHERE s.owner_id = u.id)
                    END as rating
             FROM users u 
             WHERE u.id = $1`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            message: 'User retrieved successfully',
            data: { user: result.rows[0] }
        });
        
    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user'
        });
    }
};

// Update user password
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        
        // Get current password
        const userResult = await query(
            'SELECT password FROM users WHERE id = $1',
            [userId]
        );
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        const user = userResult.rows[0];
        
        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }
        
        // Hash new password
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
        
        // Update password
        await query(
            'UPDATE users SET password = $1 WHERE id = $2',
            [hashedNewPassword, userId]
        );
        
        res.json({
            success: true,
            message: 'Password updated successfully'
        });
        
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update password'
        });
    }
};

// Update user profile (basic info)
const updateProfile = async (req, res) => {
    try {
        const { name, address } = req.body;
        const userId = req.user.id;
        
        const result = await query(
            `UPDATE users SET name = $1, address = $2 
             WHERE id = $3 
             RETURNING id, name, email, address, role`,
            [name, address, userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user: result.rows[0] }
        });
        
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if user exists
        const userExists = await query(
            'SELECT id FROM users WHERE id = $1',
            [id]
        );
        
        if (userExists.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Delete user (cascading will handle related records)
        await query('DELETE FROM users WHERE id = $1', [id]);
        
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    }
};

module.exports = {
    getAllUsers,
    getUserStats,
    createUser,
    getUserById,
    updatePassword,
    updateProfile,
    deleteUser
};