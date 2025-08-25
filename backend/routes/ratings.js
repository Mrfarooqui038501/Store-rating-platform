const express = require('express');
const router = express.Router();
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

const {
    authenticateToken,
    requireAdmin,
    requireUserOrAdmin
} = require('../middleware/auth');

const { validateRating } = require('../utils/validation');


router.post('/', authenticateToken, requireUserOrAdmin, validateRating, submitRating);


router.get('/', authenticateToken, requireAdmin, getAllRatings);


router.get('/stats', authenticateToken, requireAdmin, getRatingStats);


router.get('/user', authenticateToken, getUserRatings);


router.get('/store/:storeId', authenticateToken, getStoreRatings);


router.get('/user/:storeId', authenticateToken, getUserRating);


router.put('/:id', authenticateToken, validateRating, updateRating);


router.delete('/:id', authenticateToken, deleteRating);

module.exports = router;