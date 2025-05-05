const express = require('express');
const router = express.Router();
const {
    getRecommendedUsers,
    getMyFriends,
    sendFriendRequest,
    acceptFriendRequest,
    getFriendRequests,
    getOutgoingFriendReqs
} = require('../controllers/userController');
const { authUser } = require('../middleware/authMiddleware');


router.get('/recommended-users',authUser ,getRecommendedUsers);
router.get('/my-friends',authUser, getMyFriends);
router.get('/friend-requests',authUser, getFriendRequests);
router.post('/send-friend-request/:id',authUser, sendFriendRequest);
router.post('/accept-friend-request/:id',authUser, acceptFriendRequest);
router.get('/incoming-friend-requests',authUser, getFriendRequests);
router.get('/outgoing-friend-requests',authUser, getOutgoingFriendReqs);


module.exports = router;