const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserStats,
    createUser,
    getUserById,
    updatePassword,
    updateProfile,
    deleteUser
} = require('../controllers/userController');
const {
    authenticateToken,
    requireAdmin,
    requireOwnershipOrAdmin
} = require('../middleware/auth');
const {
    validateUserCreation,
    validatePasswordUpdate,
    validateSearchParams
} = require('../utils/validation');


router.get('/', authenticateToken, requireAdmin, validateSearchParams, getAllUsers);


router.get('/stats', authenticateToken, requireAdmin, getUserStats);


router.post('/', authenticateToken, requireAdmin, validateUserCreation, createUser);


router.put('/password', authenticateToken, validatePasswordUpdate, updatePassword);


router.put('/profile', authenticateToken, updateProfile);


router.get('/:id', authenticateToken, requireOwnershipOrAdmin(), getUserById);


router.delete('/:id', authenticateToken, requireAdmin, deleteUser);

module.exports = router;