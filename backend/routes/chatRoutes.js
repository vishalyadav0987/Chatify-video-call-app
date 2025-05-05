const express = require('express');
const { authUser } = require('../middleware/authMiddleware');
const { getStreamToken } = require('../controllers/chatControllers');
const router = express.Router();

router.get('/token',authUser,getStreamToken)

module.exports = router;