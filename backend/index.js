const express = require("express");
const path = require('path');
const app = express();
const PORT = process.env.PORT || 4000;
require('dotenv').config();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const connectDB = require("./connectDB/connect");
const authUserRoutes = require("./routes/authUserRoutes");
const friendRequestRoutes = require("./routes/friendRequestRoutes");
const chatRoutes = require("./routes/chatRoutes");


app.use(cors(
  {
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }
));
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(fileUpload());


app.use("/api/v1/auth", authUserRoutes);
app.use("/api/v1/friend", friendRequestRoutes);
app.use("/api/v1/chat", chatRoutes);

app.use("/test", (req, res) => {
  res.send("<h1>This route is used for testing purposes. Yeah, it's working!</h1>");
});

if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "..", "frontend", "dist"); 
  app.use(express.static(frontendPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  }
  );
}


const server = require("http").createServer(app);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log("Something went wrong in connecting to the server:", error.message);
  }
};

start();