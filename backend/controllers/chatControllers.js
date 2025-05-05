const { generateStreamToken } = require("../Stream/Stream");

const getStreamToken = async (req, res) => {
    try {
        const token = generateStreamToken(req.user._id);
        res.status(200).json({
            success: true,
            token,
        });
    } catch (error) {
        console.error("Error generating stream token:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

module.exports = {
    getStreamToken,
};