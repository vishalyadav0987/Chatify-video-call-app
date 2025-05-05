
const UserSchema = require('../modals/UserSchema');
const bcryptJs = require('bcryptjs');
const generateAndSetToken = require('../generateToken/generateTokenAndSetToken');
const { upsertStreamUser } = require('../Stream/Stream');

/*------------------------------------------
            Register Controller
------------------------------------------*/
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const existingUser = await UserSchema.findOne({ email }).lean();
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists." });
        }

        const idx = Math.floor(Math.random() * 100) + 1; // generate a num between 1-100
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;


        const hashedPassword = await bcryptJs.hash(password, 10)

        const newUser = new UserSchema({
            name,
            email,
            password: hashedPassword,
            avatar: randomAvatar
        });

        await newUser.save();

        // Upsert the user in Stream
        try {
            await upsertStreamUser({
                id: newUser._id.toString(),
                name: newUser.name,
                image: newUser.avatar || "",
            });
            console.log("Stream user upserted successfully");

        } catch (error) {
            console.error("Error upserting Stream user:", error);
            return res.status(500).json({ success: false, message: "Failed to upsert Stream user." });
        }
        const token = generateAndSetToken(newUser._id, res);

        // Send verification email asynchronously

        res.status(201).json({
            success: true,
            token,
            user: newUser,
            message: "User successfully registered."
        });
    } catch (error) {
        console.error("Error in registerUser:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong in registration!"
        });
    }
};



/*------------------------------------------
            onBoarding Controller
------------------------------------------*/
const onBoardingUser = async (req, res) => {
    try {
        const userId = req.user._id;

        const { name, bio, nativeLanguage, learningLanguage, location } = req.body;

        if (!name || !bio || !nativeLanguage || !learningLanguage || !location) {
            return res.status(400).json({
                message: "All fields are required",
                missingFields: [
                    !fullName && "fullName",
                    !bio && "bio",
                    !nativeLanguage && "nativeLanguage",
                    !learningLanguage && "learningLanguage",
                    !location && "location",
                ].filter(Boolean),
            });
        }

        const updatedUser = await UserSchema.findByIdAndUpdate(
            userId,
            {
                ...req.body,
                isOnboarded: true,
            },
            { new: true }
        );

        if (!updatedUser) return res.status(404).json({ message: "User not found" });

        // Upsert the user in Stream
        try {
            await upsertStreamUser({
                id: updatedUser._id.toString(),
                name: updatedUser.name,
                image: updatedUser.avatar || "",
            });
            console.log("Stream user upserted successfully");

        } catch (error) {
            console.error("Error upserting Stream user:", error);
            return res.status(500).json({ success: false, message: "Failed to upsert Stream user." });
        }

        res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Onboarding error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}



/*------------------------------------------
            Login  Controller
------------------------------------------*/
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({
                success: false,
                message: "fields are required.",
            })
        }
        const user = await UserSchema.findOne({ email });
        if (!user) {
            return res.json({
                success: false,
                message: "Invalid email or password.",
            })
        }
        const isValidPassword = await bcryptJs.compare(password, user.password);
        if (!isValidPassword) {
            return res.json({
                success: false,
                message: "Invalid email or password.",
            })
        }
        await user.save();

        generateAndSetToken(user._id, res);

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            data: {
                ...user._doc,
                password: undefined,
            }
        })

    } catch (error) {
        console.log("Something went wrong in loginUser function: ", error.message);
        return res.status(500).json({ success: false, message: "Something went wrong in loginUser!" });
    }
}






/*------------------------------------------
            Logout  Controller
------------------------------------------*/
const logoutUser = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.json({
                success: false,
                message: "You are not logged in.",
            })
        }
        res.clearCookie("token");
        res.json({
            success: true,
            message: "User Successfully logged out."
        })
    } catch (error) {
        console.log("Something went wrong in logoutUser function: ", error.message);
        return res.status(500).json({ success: false, message: "Something went wrong in logoutUser!" });
    }
}




/*--------------------------------------------------
            authorizedUser  Controller
----------------------------------------------------*/
const authorizedUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        // Fetch the latest user data from the database
        const user = await UserSchema.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error("Error in authorizedUser:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};









module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    authorizedUser,
    onBoardingUser

}