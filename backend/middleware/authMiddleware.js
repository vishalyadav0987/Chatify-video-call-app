
    const jwt = require("jsonwebtoken");
const UserSchema = require('../modals/UserSchema');

const authUser = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
        
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded?.userId) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }

        const user = await UserSchema.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error in authUser:", error);
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};



module.exports = { authUser};
