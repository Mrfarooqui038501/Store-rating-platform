const express = require('express');
const router = express.Router();

// Import controllers
const {
    submitRating,
    getUserRating,
    getStoreRatings,
    getAllRatings,
    getUserRatings,
    updateRating,
    deleteRating,
    getRatingStats
} = require('../controllers/ratingController');

// Import middleware
const {
    authenticateToken,
    requireAdmin,
    requireUserOrAdmin
} = require('../middleware/auth');

// Import validation
const { validateRating } = require('../utils/validation');

// @route   POST /api/ratings
// @desc    Submit or update rating for a store
// @access  Private (Normal User or Admin)
router.post('/', authenticateToken, requireUserOrAdmin, validateRating, submitRating);

// @route   GET /api/ratings
// @desc    Get all ratings (Admin only)
// @access  Private (Admin)
router.get('/', authenticateToken, requireAdmin, getAllRatings);

// @route   GET /api/ratings/stats
// @desc    Get rating statistics (Admin only)
// @access  Private (Admin)
router.get('/stats', authenticateToken, requireAdmin, getRatingStats);

// @route   GET /api/ratings/user
// @desc    Get current user's ratings
// @access  Private
router.get('/user', authenticateToken, getUserRatings);

// @route   GET /api/ratings/store/:storeId
// @desc    Get all ratings for a specific store
// @access  Private
router.get('/store/:storeId', authenticateToken, getStoreRatings);

// @route   GET /api/ratings/user/:storeId
// @desc    Get user's rating for a specific store
// @access  Private
router.get('/user/:storeId', authenticateToken, getUserRating);

// @route   PUT /api/ratings/:id
// @desc    Update rating
// @access  Private (Rating owner or Admin)
router.put('/:id', authenticateToken, validateRating, updateRating);

// @route   DELETE /api/ratings/:id
// @desc    Delete rating
// @access  Private (Rating owner or Admin)
router.delete('/:id', authenticateToken, deleteRating);

module.exports = router;