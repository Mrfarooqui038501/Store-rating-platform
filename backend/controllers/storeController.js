const bcrypt = require('bcryptjs');
const { query, transaction } = require('../config/database');

// Get all stores (for normal users)
const getAllStores = async (req, res) => {
    try {
        const { name, address, sortBy = 'name', sortOrder = 'asc', page = 1, limit = 10 } = req.query;
        const userId = req.user.id;
        
        // Calculate offset for pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        let queryText = `
            SELECT s.id, s.name, s.email, s.address, s.created_at,
                   COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) as average_rating,
                   COUNT(r.rating) as total_ratings,
                   ur.rating as user_rating
            FROM stores s
            LEFT JOIN ratings r ON s.id = r.store_id
            LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = $1
            WHERE 1=1
        `;
        
        const params = [userId];
        let paramCount = 1;
        
        // Add filters
        if (name && name.trim()) {
            paramCount++;
            queryText += ` AND s.name ILIKE $${paramCount}`;
            params.push(`%${name.trim()}%`);
        }
        
        if (address && address.trim()) {
            paramCount++;
            queryText += ` AND s.address ILIKE $${paramCount}`;
            params.push(`%${address.trim()}%`);
        }
        
        queryText += ' GROUP BY s.id, s.name, s.email, s.address, s.created_at, ur.rating';
        
        // Add sorting
        const validSortFields = ['name', 'address', 'average_rating', 'created_at'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
        const order = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        
        queryText += ` ORDER BY ${sortField} ${order}`;
        
        // Add pagination
        paramCount++;
        queryText += ` LIMIT $${paramCount}`;
        params.push(parseInt(limit));
        
        paramCount++;
        queryText += ` OFFSET $${paramCount}`;
        params.push(offset);
        
        // Get total count for pagination
        let countQuery = `
            SELECT COUNT(DISTINCT s.id) as total
            FROM stores s
            WHERE 1=1
        `;
        const countParams = [];
        let countParamCount = 0;
        
        if (name && name.trim()) {
            countParamCount++;
            countQuery += ` AND s.name ILIKE $${countParamCount}`;
            countParams.push(`%${name.trim()}%`);
        }
        
        if (address && address.trim()) {
            countParamCount++;
            countQuery += ` AND s.address ILIKE $${countParamCount}`;
            countParams.push(`%${address.trim()}%`);
        }
        
        const [storesResult, countResult] = await Promise.all([
            query(queryText, params),
            query(countQuery, countParams)
        ]);
        
        const totalStores = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(totalStores / parseInt(limit));
        
        res.json({
            success: true,
            message: 'Stores retrieved successfully',
            data: {
                stores: storesResult.rows,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalStores,
                    limit: parseInt(limit)
                }
            }
        });
        
    } catch (error) {
        console.error('Get stores error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve stores'
        });
    }
};

// Get stores for admin (with additional details)
const getStoresForAdmin = async (req, res) => {
    try {
        const { name, email, address, sortBy = 'name', sortOrder = 'asc', page = 1, limit = 10 } = req.query;
        
        // Calculate offset for pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        let queryText = `
            SELECT s.id, s.name, s.email, s.address, s.created_at,
                   COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) as average_rating,
                   COUNT(r.rating) as total_ratings,
                   u.name as owner_name, u.email as owner_email
            FROM stores s
            LEFT JOIN ratings r ON s.id = r.store_id
            LEFT JOIN users u ON s.owner_id = u.id
            WHERE 1=1
        `;
        
        const params = [];
        let paramCount = 0;
        
        // Add filters
        if (name && name.trim()) {
            paramCount++;
            queryText += ` AND s.name ILIKE $${paramCount}`;
            params.push(`%${name.trim()}%`);
        }
        
        if (email && email.trim()) {
            paramCount++;
            queryText += ` AND s.email ILIKE $${paramCount}`;
            params.push(`%${email.trim()}%`);
        }
        
        if (address && address.trim()) {
            paramCount++;
            queryText += ` AND s.address ILIKE $${paramCount}`;
            params.push(`%${address.trim()}%`);
        }
        
        queryText += ' GROUP BY s.id, s.name, s.email, s.address, s.created_at, u.name, u.email';
        
        // Add sorting
        const validSortFields = ['name', 'email', 'address', 'average_rating', 'created_at'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
        const order = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        
        queryText += ` ORDER BY ${sortField} ${order}`;
        
        // Add pagination
        paramCount++;
        queryText += ` LIMIT $${paramCount}`;
        params.push(parseInt(limit));
        
        paramCount++;
        queryText += ` OFFSET $${paramCount}`;
        params.push(offset);
        
        // Get total count for pagination
        let countQuery = `
            SELECT COUNT(DISTINCT s.id) as total
            FROM stores s
            LEFT JOIN users u ON s.owner_id = u.id
            WHERE 1=1
        `;
        const countParams = [];
        let countParamCount = 0;
        
        if (name && name.trim()) {
            countParamCount++;
            countQuery += ` AND s.name ILIKE $${countParamCount}`;
            countParams.push(`%${name.trim()}%`);
        }
        
        if (email && email.trim()) {
            countParamCount++;
            countQuery += ` AND s.email ILIKE $${countParamCount}`;
            countParams.push(`%${email.trim()}%`);
        }
        
        if (address && address.trim()) {
            countParamCount++;
            countQuery += ` AND s.address ILIKE $${countParamCount}`;
            countParams.push(`%${address.trim()}%`);
        }
        
        const [storesResult, countResult] = await Promise.all([
            query(queryText, params),
            query(countQuery, countParams)
        ]);
        
        const totalStores = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(totalStores / parseInt(limit));
        
        res.json({
            success: true,
            message: 'Stores retrieved successfully',
            data: {
                stores: storesResult.rows,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalStores,
                    limit: parseInt(limit)
                }
            }
        });
        
    } catch (error) {
        console.error('Get stores for admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve stores'
        });
    }
};

// Create new store (Admin only)
const createStore = async (req, res) => {
    try {
        const { name, email, address, owner_id, password } = req.body;
        
        // Validate required fields
        if (!name || !email || !address || !owner_id) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, address, and owner_id are required'
            });
        }
        
        // Check if store email already exists
        const existingStore = await query(
            'SELECT id FROM stores WHERE email = $1',
            [email]
        );
        
        if (existingStore.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Store with this email already exists'
            });
        }
        
        // Check if owner exists
        const ownerExists = await query(
            'SELECT id, role FROM users WHERE id = $1',
            [owner_id]
        );
        
        if (ownerExists.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Store owner not found'
            });
        }
        
        const owner = ownerExists.rows[0];
        const queries = [];
        
        // If owner is not already a store owner, update their role
        if (owner.role !== 'store_owner') {
            if (password) {
                const saltRounds = 12;
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                queries.push({
                    text: 'UPDATE users SET role = $1, password = $2 WHERE id = $3',
                    params: ['store_owner', hashedPassword, owner_id]
                });
            } else {
                queries.push({
                    text: 'UPDATE users SET role = $1 WHERE id = $2',
                    params: ['store_owner', owner_id]
                });
            }
        }
        
        // Insert store
        queries.push({
            text: `INSERT INTO stores (name, email, address, owner_id) 
                   VALUES ($1, $2, $3, $4) 
                   RETURNING id, name, email, address, owner_id, created_at`,
            params: [name, email, address, owner_id]
        });
        
        const results = await transaction(queries);
        const store = results[results.length - 1].rows[0]; // Last query result
        
        res.status(201).json({
            success: true,
            message: 'Store created successfully',
            data: { store }
        });
        
    } catch (error) {
        console.error('Create store error:', error);
        if (error.code === '23505') { // Unique violation
            return res.status(400).json({
                success: false,
                message: 'Store with this email already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to create store'
        });
    }
};

// Get store by ID
const getStoreById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        // Validate store ID
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid store ID'
            });
        }
        
        const result = await query(
            `SELECT s.id, s.name, s.email, s.address, s.created_at,
                    COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) as average_rating,
                    COUNT(r.rating) as total_ratings,
                    ur.rating as user_rating,
                    u.name as owner_name
             FROM stores s
             LEFT JOIN ratings r ON s.id = r.store_id
             LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = $2
             LEFT JOIN users u ON s.owner_id = u.id
             WHERE s.id = $1
             GROUP BY s.id, s.name, s.email, s.address, s.created_at, ur.rating, u.name`,
            [id, userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Store retrieved successfully',
            data: { store: result.rows[0] }
        });
        
    } catch (error) {
        console.error('Get store by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve store'
        });
    }
};

// Get store statistics (Admin only)
const getStoreStats = async (req, res) => {
    try {
        const statsQuery = `
            SELECT 
                COUNT(DISTINCT s.id) as total_stores,
                COUNT(DISTINCT CASE WHEN r.rating IS NOT NULL THEN s.id END) as stores_with_ratings,
                COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) as overall_average_rating,
                COUNT(r.id) as total_ratings
            FROM stores s
            LEFT JOIN ratings r ON s.id = r.store_id
        `;
        
        const result = await query(statsQuery);
        
        // Get rating distribution
        const distributionQuery = `
            SELECT 
                rating,
                COUNT(*) as count
            FROM ratings
            GROUP BY rating
            ORDER BY rating DESC
        `;
        
        const distributionResult = await query(distributionQuery);
        
        // Get top rated stores
        const topStoresQuery = `
            SELECT 
                s.name,
                s.email,
                ROUND(AVG(r.rating)::numeric, 2) as average_rating,
                COUNT(r.rating) as total_ratings
            FROM stores s
            JOIN ratings r ON s.id = r.store_id
            GROUP BY s.id, s.name, s.email
            HAVING COUNT(r.rating) >= 3
            ORDER BY AVG(r.rating) DESC, COUNT(r.rating) DESC
            LIMIT 5
        `;
        
        const topStoresResult = await query(topStoresQuery);
        
        const stats = result.rows[0];
        
        res.json({
            success: true,
            message: 'Store statistics retrieved successfully',
            data: {
                ...stats,
                rating_distribution: distributionResult.rows,
                top_stores: topStoresResult.rows
            }
        });
        
    } catch (error) {
        console.error('Get store stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve store statistics'
        });
    }
};

// Get store ratings for owner
const getStoreRatings = async (req, res) => {
    try {
        const { storeId } = req.params;
        const userId = req.user.id;
        const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
        
        // Validate store ID
        if (!storeId || isNaN(parseInt(storeId))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid store ID'
            });
        }
        
        // Check if user owns this store or is admin
        if (req.user.role !== 'system_admin') {
            const storeOwner = await query(
                'SELECT owner_id FROM stores WHERE id = $1',
                [storeId]
            );
            
            if (storeOwner.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Store not found'
                });
            }
            
            if (storeOwner.rows[0].owner_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied: You can only view ratings for your own store'
                });
            }
        }
        
        // Calculate offset for pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        // Validate sort parameters
        const validSortFields = ['rating', 'created_at', 'updated_at'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
        const order = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        
        // Get ratings with pagination
        const ratingsQuery = `
            SELECT r.id, r.rating, r.created_at, r.updated_at,
                   u.name as user_name, u.email as user_email
            FROM ratings r
            JOIN users u ON r.user_id = u.id
            WHERE r.store_id = $1
            ORDER BY r.${sortField} ${order}
            LIMIT $2 OFFSET $3
        `;
        
        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total
            FROM ratings r
            WHERE r.store_id = $1
        `;
        
        // Get store info and average rating
        const storeInfoQuery = `
            SELECT s.id, s.name, s.email,
                   COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) as average_rating,
                   COUNT(r.rating) as total_ratings
            FROM stores s
            LEFT JOIN ratings r ON s.id = r.store_id
            WHERE s.id = $1
            GROUP BY s.id, s.name, s.email
        `;
        
        const [ratingsResult, countResult, storeInfoResult] = await Promise.all([
            query(ratingsQuery, [storeId, parseInt(limit), offset]),
            query(countQuery, [storeId]),
            query(storeInfoQuery, [storeId])
        ]);
        
        if (storeInfoResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }
        
        const totalRatings = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(totalRatings / parseInt(limit));
        
        res.json({
            success: true,
            message: 'Store ratings retrieved successfully',
            data: {
                store: storeInfoResult.rows[0],
                ratings: ratingsResult.rows,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalRatings,
                    limit: parseInt(limit)
                }
            }
        });
        
    } catch (error) {
        console.error('Get store ratings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve store ratings'
        });
    }
};

// Update store (Admin only)
const updateStore = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, address } = req.body;
        
        // Validate store ID
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid store ID'
            });
        }
        
        // Validate required fields
        if (!name || !email || !address) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and address are required'
            });
        }
        
        // Check if email is already taken by another store
        const emailCheck = await query(
            'SELECT id FROM stores WHERE email = $1 AND id != $2',
            [email, id]
        );
        
        if (emailCheck.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email is already taken by another store'
            });
        }
        
        const result = await query(
            `UPDATE stores 
             SET name = $1, email = $2, address = $3, updated_at = CURRENT_TIMESTAMP
             WHERE id = $4 
             RETURNING id, name, email, address, created_at, updated_at`,
            [name, email, address, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Store updated successfully',
            data: { store: result.rows[0] }
        });
        
    } catch (error) {
        console.error('Update store error:', error);
        if (error.code === '23505') { // Unique violation
            return res.status(400).json({
                success: false,
                message: 'Email is already taken by another store'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to update store'
        });
    }
};

// Delete store (Admin only)
const deleteStore = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate store ID
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid store ID'
            });
        }
        
        // Check if store exists and get owner info
        const storeCheck = await query(
            'SELECT id, owner_id FROM stores WHERE id = $1',
            [id]
        );
        
        if (storeCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }
        
        const ownerId = storeCheck.rows[0].owner_id;
        
        const queries = [];
        
        // Delete store (cascading will handle related records like ratings)
        queries.push({
            text: 'DELETE FROM stores WHERE id = $1',
            params: [id]
        });
        
        // Update owner role back to normal_user if they don't own other stores
        if (ownerId) {
            queries.push({
                text: `UPDATE users 
                       SET role = 'normal_user' 
                       WHERE id = $1 
                       AND role = 'store_owner' 
                       AND NOT EXISTS (
                           SELECT 1 FROM stores WHERE owner_id = $1 AND id != $2
                       )`,
                params: [ownerId, id]
            });
        }
        
        await transaction(queries);
        
        res.json({
            success: true,
            message: 'Store deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete store error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete store'
        });
    }
};

module.exports = {
    getAllStores,
    getStoresForAdmin,
    createStore,
    getStoreById,
    getStoreStats,
    getStoreRatings,
    updateStore,
    deleteStore
};