// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { login, logout } = require('../controllers/authcontroller');
//                               ✅ todo en minúsculas
router.get('/login', (req, res) => res.render('login', { error: null, layout: false }));

router.post('/login', login);
router.get('/logout', logout);

module.exports = router;
