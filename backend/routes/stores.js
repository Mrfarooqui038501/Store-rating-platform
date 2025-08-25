const express = require('express');
const router = express.Router();
const {
    getAllStores,
    getStoresForAdmin,
    createStore,
    getStoreById,
    getStoreStats,
    getStoreRatings,
    updateStore,
    deleteStore
} = require('../controllers/storeController');

const {
    authenticateToken,
    requireAdmin,
    requireStoreOwnerOrAdmin
} = require('../middleware/auth');

const {
    validateStoreCreation,
    validateSearchParams
} = require('../utils/validation');


router.get('/', authenticateToken, validateSearchParams, getAllStores);


router.get('/admin', authenticateToken, requireAdmin, validateSearchParams, getStoresForAdmin);


router.get('/stats', authenticateToken, requireAdmin, getStoreStats);


router.post('/', authenticateToken, requireAdmin, validateStoreCreation, createStore);


router.get('/:id', authenticateToken, getStoreById);


router.get('/:storeId/ratings', authenticateToken, requireStoreOwnerOrAdmin, getStoreRatings);


router.put('/:id', authenticateToken, requireAdmin, validateStoreCreation, updateStore);


router.delete('/:id', authenticateToken, requireAdmin, deleteStore);

module.exports = router;