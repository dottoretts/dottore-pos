const express = require('express');
const { login, checkAuth, logout } = require('../controllers/authController');
const router = express.Router();

router.post('/login', login);
router.get('/check', checkAuth);
router.post('/logout', logout);

module.exports = router;