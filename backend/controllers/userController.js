const UserSchema = require('../modals/UserSchema');
const FriendRequestSchema = require('../modals/FriendRequest');


/*------------------------------------------
        Getrecommended Controller
------------------------------------------*/
const getRecommendedUsers = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const currentUser = await UserSchema.findById(currentUserId);
        if (!currentUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const recommendedUsers = await UserSchema.find({
            $and: [
                { _id: { $ne: currentUserId } },
                { _id: { $nin: currentUser.friends } },
                { isOnboarded: true },
            ]
        }).select("-password");

        if (recommendedUsers.length === 0) {
            return res.status(404).json({ success: false, message: "No recommended users found" });
        }
        res.status(200).json({
            success: true,
            message: "Recommended users fetched successfully",
            data: recommendedUsers,
        });
    } catch (error) {
        console.log("Something went wrong in getRecommendedUsers function: ", error.message);
        return res.status(500).json({ success: false, message: "Something went wrong in getRecommendedUsers!" });
    }

}



/*------------------------------------------
        getMyFriends Controller
------------------------------------------*/
const getMyFriends = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const currentUser = await UserSchema.findById(currentUserId);
        if (!currentUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const friends = await UserSchema.find({
            _id: { $in: currentUser.friends }
        }).select("-password").populate("friends", "name avatar nativeLanguage learningLanguage");;

        if (friends.length === 0) {
            return res.status(404).json({ success: false, message: "No friends found" });
        }
        res.status(200).json({
            success: true,
            message: "Friends fetched successfully",
            data: friends,
        });
    } catch (error) {
        console.log("Something went wrong in getMyFriends function: ", error.message);
        return res.status(500).json({ success: false, message: "Something went wrong in getMyFriends!" });
    }

}

/*------------------------------------------
        Send Friend Controller
------------------------------------------*/
const sendFriendRequest = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const { id: recipientId } = req.params;

        if (currentUserId === recipientId) {
            return res.status(400).json({ success: false, message: "You cannot send a friend request to yourself" });
        }
        const currentUser = await UserSchema.findById(currentUserId);
        const recipientUser = await UserSchema.findById(recipientId);
        if (!currentUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        if (!recipientUser) {
            return res.status(404).json({ success: false, message: "Recipient user not found" });
        }
        if (currentUser.friends.includes(recipientId)) {
            return res.status(400).json({ success: false, message: "You are already friends with this user" });
        }
        if (recipientUser.friends.includes(currentUserId)) {
            return res.status(400).json({ success: false, message: "You are already friends with this user" });
        }

        // check if a req already exists
        const existingRequest = await FriendRequestSchema.findOne({
            $or: [
                { sender: currentUserId, recipient: recipientId },
                { sender: recipientId, recipient: currentUserId }
            ]
        });

        if (existingRequest) {
            return res.status(400).json({ success: false, message: "Friend request already sent" });
        }
        const friendRequest = await FriendRequestSchema.create({
            sender: currentUserId,
            recipient: recipientId,
        });
        if (!friendRequest) {
            return res.status(500).json({ success: false, message: "Failed to send friend request" });
        }
        res.status(200).json({
            success: true,
            message: "Friend request sent successfully",
            data: friendRequest,
        });
    } catch (error) {
        console.log("Something went wrong in sendFriendRequest function: ", error.message);
        return res.status(500).json({ success: false, message: "Something went wrong in sendFriendRequest!" });
    }
}




/*------------------------------------------
        Accept FriendRequest Controller
------------------------------------------*/
const acceptFriendRequest = async (req, res) => {
    try {
        const { id: requestId } = req.params;
        const friendRequest = await FriendRequestSchema.findById(requestId);
        if (!friendRequest) {
            return res.status(404).json({ success: false, message: "Friend request not found" });
        }
        const { sender, recipient } = friendRequest;
        const currentUserId = req.user._id;
        if (currentUserId.toString() !== recipient._id.toString()) {
            return res.status(403).json({ success: false, message: "You are not authorized to accept this friend request" });
        }

        friendRequest.status = "accepted";
        await friendRequest.save();

        await UserSchema.findByIdAndUpdate(sender, {
            $addToSet: { friends: recipient }
        });
        await UserSchema.findByIdAndUpdate(recipient, {
            $addToSet: { friends: sender }
        });
        res.status(200).json({
            success: true,
            message: "Friend request accepted successfully",
            data: friendRequest,
        });
    } catch (error) {
        console.log("Something went wrong in acceptFriendRequest function: ", error.message);
        return res.status(500).json({ success: false, message: "Something went wrong in acceptFriendRequest!" });
    }
}


/*------------------------------------------
        getFriendRequests controllers
------------------------------------------*/
const getFriendRequests = async (req, res) => {
    try {
        const incomingReqs = await FriendRequestSchema.find({
            recipient: req.user._id,
            status: "pending",
        }).populate("sender", "name avatar nativeLanguage learningLanguage");


        // ish present user ne kisi aur friend request bheji hai
        // woh accepted request hai ye
        const acceptedReqs = await FriendRequestSchema.find({
            sender: req.user._id,
            status: "accepted",
        }).populate("recipient", "name avatar");

        res.status(200).json({ incomingReqs, acceptedReqs });
    } catch (error) {
        console.log("Something went wrong in getFriendRequests function: ", error.message);
        return res.status(500).json({ success: false, message: "Something went wrong in getFriendRequests!" });

    }
}




/*------------------------------------------
    getOutgoingFriendReqs controllers
------------------------------------------*/
const getOutgoingFriendReqs = async (req, res) => {
    try {
        const outgoingRequests = await FriendRequestSchema.find({
            sender: req.user._id,
            status: "pending",
        }).populate("recipient", "name avatar nativeLanguage learningLanguage");

        if (outgoingRequests.length === 0) {
            return res.status(404).json({ success: false, message: "No outgoing friend requests found" });
        }
        res.status(200).json({
            success: true,
            message: "Outgoing friend requests fetched successfully",
            data: outgoingRequests,
        });

    } catch (error) {
        console.log("Something went wrong in getOutgoingFriendReqs function: ", error.message);
        return res.status(500).json({ success: false, message: "Something went wrong in getOutgoingFriendReqs!" });
    }
}

module.exports = {
    getRecommendedUsers,
    getMyFriends,
    sendFriendRequest,
    acceptFriendRequest,
    getFriendRequests,
    getOutgoingFriendReqs
}