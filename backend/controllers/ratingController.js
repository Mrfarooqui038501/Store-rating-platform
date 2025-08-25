const { query } = require('../config/database');

// Submit or update rating
const submitRating = async (req, res) => {
    try {
        const { store_id, rating } = req.body;
        const user_id = req.user.id;
        
        // Check if store exists
        const storeExists = await query(
            'SELECT id FROM stores WHERE id = $1',
            [store_id]
        );
        
        if (storeExists.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }
        
        // Check if user has already rated this store
        const existingRating = await query(
            'SELECT id FROM ratings WHERE user_id = $1 AND store_id = $2',
            [user_id, store_id]
        );
        
        let result;
        let message;
        
        if (existingRating.rows.length > 0) {
            // Update existing rating
            result = await query(
                `UPDATE ratings SET rating = $1 
                 WHERE user_id = $2 AND store_id = $3 
                 RETURNING id, rating, created_at, updated_at`,
                [rating, user_id, store_id]
            );
            message = 'Rating updated successfully';
        } else {
            // Insert new rating
            result = await query(
                `INSERT INTO ratings (user_id, store_id, rating) 
                 VALUES ($1, $2, $3) 
                 RETURNING id, rating, created_at, updated_at`,
                [user_id, store_id, rating]
            );
            message = 'Rating submitted successfully';
        }
        
        res.json({
            success: true,
            message: message,
            data: {
                rating: result.rows[0]
            }
        });
        
    } catch (error) {
        console.error('Submit rating error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit rating'
        });
    }
};

// Get user's rating for a specific store
const getUserRating = async (req, res) => {
    try {
        const { storeId } = req.params;
        const user_id = req.user.id;
        
        const result = await query(
            `SELECT r.id, r.rating, r.created_at, r.updated_at,
                    s.name as store_name
             FROM ratings r
             JOIN stores s ON r.store_id = s.id
             WHERE r.user_id = $1 AND r.store_id = $2`,
            [user_id, storeId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Rating not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Rating retrieved successfully',
            data: {
                rating: result.rows[0]
            }
        });
        
    } catch (error) {
        console.error('Get user rating error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve rating'
        });
    }
};

// Get all ratings for a store
const getStoreRatings = async (req, res) => {
    try {
        const { storeId } = req.params;
        const { sortBy = 'created_at', sortOrder = 'desc' } = req.query;
        
        // Check if store exists
        const storeExists = await query(
            'SELECT id FROM stores WHERE id = $1',
            [storeId]
        );
        
        if (storeExists.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }
        
        // Build query with sorting
        const validSortFields = ['rating', 'created_at', 'updated_at'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
        const order = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        
        const result = await query(
            `SELECT r.id, r.rating, r.created_at, r.updated_at,
                    u.name as user_name
             FROM ratings r
             JOIN users u ON r.user_id = u.id
             WHERE r.store_id = $1
             ORDER BY r.${sortField} ${order}`,
            [storeId]
        );
        
        // Get store average rating
        const avgResult = await query(
            `SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0) as average_rating,
                    COUNT(*) as total_ratings
             FROM ratings WHERE store_id = $1`,
            [storeId]
        );
        
        res.json({
            success: true,
            message: 'Store ratings retrieved successfully',
            data: {
                ratings: result.rows,
                statistics: avgResult.rows[0],
                total: result.rows.length
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

// Get all ratings (Admin only)
const getAllRatings = async (req, res) => {
    try {
        const { sortBy = 'created_at', sortOrder = 'desc' } = req.query;
        
        // Build query with sorting
        const validSortFields = ['rating', 'created_at', 'updated_at'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
        const order = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        
        const result = await query(
            `SELECT r.id, r.rating, r.created_at, r.updated_at,
                    u.name as user_name, u.email as user_email,
                    s.name as store_name, s.email as store_email
             FROM ratings r
             JOIN users u ON r.user_id = u.id
             JOIN stores s ON r.store_id = s.id
             ORDER BY r.${sortField} ${order}`
        );
        
        res.json({
            success: true,
            message: 'All ratings retrieved successfully',
            data: {
                ratings: result.rows,
                total: result.rows.length
            }
        });
        
    } catch (error) {
        console.error('Get all ratings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve ratings'
        });
    }
};

// Get user's all ratings
const getUserRatings = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { sortBy = 'created_at', sortOrder = 'desc' } = req.query;
        
        // Build query with sorting
        const validSortFields = ['rating', 'created_at', 'updated_at'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
        const order = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        
        const result = await query(
            `SELECT r.id, r.rating, r.created_at, r.updated_at,
                    s.name as store_name, s.email as store_email, s.address as store_address
             FROM ratings r
             JOIN stores s ON r.store_id = s.id
             WHERE r.user_id = $1
             ORDER BY r.${sortField} ${order}`,
            [user_id]
        );
        
        res.json({
            success: true,
            message: 'User ratings retrieved successfully',
            data: {
                ratings: result.rows,
                total: result.rows.length
            }
        });
        
    } catch (error) {
        console.error('Get user ratings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user ratings'
        });
    }
};

// Update rating
const updateRating = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating } = req.body;
        const user_id = req.user.id;
        
        // Check if rating exists and belongs to user 
        let checkQuery = 'SELECT user_id, store_id FROM ratings WHERE id = $1';
        const checkParams = [id];
        
        if (req.user.role !== 'system_admin') {
            checkQuery += ' AND user_id = $2';
            checkParams.push(user_id);
        }
        
        const existingRating = await query(checkQuery, checkParams);
        
        if (existingRating.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Rating not found or access denied'
            });
        }
        
        // Update rating
        const result = await query(
            `UPDATE ratings SET rating = $1 
             WHERE id = $2 
             RETURNING id, rating, created_at, updated_at`,
            [rating, id]
        );
        
        res.json({
            success: true,
            message: 'Rating updated successfully',
            data: {
                rating: result.rows[0]
            }
        });
        
    } catch (error) {
        console.error('Update rating error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update rating'
        });
    }
};

// Delete rating
const deleteRating = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        
        // Check if rating exists and belongs to user (unless admin)
        let checkQuery = 'SELECT user_id FROM ratings WHERE id = $1';
        const checkParams = [id];
        
        if (req.user.role !== 'system_admin') {
            checkQuery += ' AND user_id = $2';
            checkParams.push(user_id);
        }
        
        const existingRating = await query(checkQuery, checkParams);
        
        if (existingRating.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Rating not found or access denied'
            });
        }
        
        // Delete rating
        await query('DELETE FROM ratings WHERE id = $1', [id]);
        
        res.json({
            success: true,
            message: 'Rating deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete rating error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete rating'
        });
    }
};

// Get rating statistics (Admin only)
const getRatingStats = async (req, res) => {
    try {
        const result = await query(`
            SELECT 
                COUNT(*) as total_ratings,
                ROUND(AVG(rating)::numeric, 2) as overall_average_rating,
                COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star_count,
                COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star_count,
                COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star_count,
                COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star_count,
                COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star_count
            FROM ratings
        `);
        
        res.json({
            success: true,
            message: 'Rating statistics retrieved successfully',
            data: result.rows[0]
        });
        
    } catch (error) {
        console.error('Get rating stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve rating statistics'
        });
    }
};

module.exports = {
    submitRating,
    getUserRating,
    getStoreRatings,
    getAllRatings,
    getUserRatings,
    updateRating,
    deleteRating,
    getRatingStats
};