const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const port = 3022;

const app = express();

// Middleware
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/gangabhumi")
    .then(() => {
        console.log("MongoDB connection successful");
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });

// Define schemas and models
const NewUserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: false, unique: true },
    mobile: { type: String, required: false, unique: true },
    password: { type: String, required: true },
}, { timestamps: true });

const NewUsers = mongoose.model("NewUser", NewUserSchema); // Model for new users

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "form.html"));
});

// Register endpoint
app.post("/register", async (req, res) => {
    try {
        const { name, emailOrMobile, password } = req.body;

        // Check if the email or mobile already exists
        const existingUser = await NewUsers.findOne({
            $or: [
                { email: emailOrMobile },  // Check for existing email
                { mobile: emailOrMobile }   // Check for existing mobile number
            ]
        });

        if (existingUser) {
            return res.status(400).send("User already exists with this email or mobile");
        }

        // Determine if emailOrMobile is email or mobile number
        let email = '';
        let mobile = '';

        if (/\S+@\S+\.\S+/.test(emailOrMobile)) {
            email = emailOrMobile;  // It's an email
        } else {
            mobile = emailOrMobile;  // It's a mobile number
        }

        // Create new user
        const user = new NewUsers({ name, email, mobile, password });
        await user.save();
        console.log("Registered User:", user);
        res.send("User Registered Successfully");
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).send("Internal Server Error: " + error.message);
    }
});

// Login endpoint
app.post("/login", async (req, res) => {
    try {
        const { emailOrMobile, password } = req.body;

        // Authenticate user
        const user = await NewUsers.findOne({ $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }], password });
        if (!user) {
            return res.status(401).send("Invalid email/mobile or password");
        }

        res.send("User Logged In Successfully");
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server Started on port ${port}`);
});
