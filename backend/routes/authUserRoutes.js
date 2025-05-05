
    const express = require('express');
const { registerUser, loginUser, logoutUser, authorizedUser, onBoardingUser } = require('../controllers/authUserControllers');
const { authUser } = require('../middleware/authMiddleware');
const router = express.Router();


router.route('/sign-up').post(registerUser);
router.route('/sign-in').post(loginUser);
router.route('/logout').post(logoutUser);
router.route('/onboarding').post(authUser, onBoardingUser);
router.route('/check-auth-user').get(authUser,authorizedUser);

module.exports = router;


    