const express = require("express");
const cors = require("cors");
const dotEnv = require("dotenv").config();
const mongoose = require("mongoose");

const app = express();
const port = 3000;

app.use(cors({
  origin: "https://www.uniccbazar.shop", // Replace with your front-end origin
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"] // Allowed headers
}));

app.use(express.json());

// MongoDB connection details
const uri = process.env.DB_URL; // Replace <db_password> and yourDatabaseName
mongoose
  .connect(uri)
  .then(() => console.log("Connected to MongoDB using Mongoose"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1); // Exit the process if connection fails
  });

// Define a Mongoose schema and model for users
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Registration route
app.post("/submit-form", async (req, res) => {
  try {
    // Extract form data from request body
    const formData = req.body;

    // Create a new user using the Mongoose model
    const newUser = new User(formData);

    // Save the user to the database
    await newUser.save();

    res.json({
      success: true,
      message: "User Registration Successful",
      data: newUser, // The saved user document
    });
  } catch (error) {
    console.error("Error inserting data into MongoDB:", error);
    res.status(500).json({
      success: false,
      message: "Error registering user",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user in the database
    const user = await User.findOne({ username, password });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Please Register Your Account" });
    }

    res.json({
      success: true,
      message: "User Login Successful",
      data: { username: user.username, email: user.email, _id: user._id },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in user",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
