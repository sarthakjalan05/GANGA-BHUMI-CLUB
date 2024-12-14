const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const port = 3022;

const app = express();

// Middleware
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/gangabhumi", { useNewUrlParser: true })
    .then(() => {
        console.log("MongoDB connection successful");
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });

// Define schema and model
const NewUserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        validate: {
            validator: function (v) {
                // If email is provided, it must be valid
                return v === undefined || v === null || /\S+@\S+\.\S+/.test(v);
            },
            message: 'Invalid email format'
        }
    },
    mobile: {
        type: String,
        validate: {
            validator: function (v) {
                // If mobile is provided, it must be valid
                return v === undefined || v === null || /^\d+$/.test(v);
            },
            message: 'Invalid mobile format'
        }
    },
    password: { type: String, required: true },
}, { timestamps: true });

// Indexes to handle unique constraints properly
NewUserSchema.index(
    { email: 1 },
    { unique: true, sparse: true, partialFilterExpression: { email: { $exists: true, $ne: null } } }
);

NewUserSchema.index(
    { mobile: 1 },
    { unique: true, sparse: true, partialFilterExpression: { mobile: { $exists: true, $ne: null } } }
);

const NewUsers = mongoose.model("NewUser", NewUserSchema);

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "form.html"));
});

// Register endpoint
app.post("/register", async (req, res) => {
    try {
        const { name, emailOrMobile, password } = req.body;

        // Determine if input is an email or mobile number
        let userObj = { name, password };
        let query = {};

        if (/\S+@\S+\.\S+/.test(emailOrMobile)) {
            userObj.email = emailOrMobile; // It's an email
            query.email = emailOrMobile;
        } else if (/^\d+$/.test(emailOrMobile)) {
            userObj.mobile = emailOrMobile; // It's a mobile number
            query.mobile = emailOrMobile;
        } else {
            return res.status(400).send("Invalid email or mobile format");
        }

        // Check if a user with the same email or mobile exists
        const existingUser = await NewUsers.findOne(query);
        if (existingUser) {
            return res.status(400).send("User already exists with this email or mobile");
        }

        // Create new user
        const user = new NewUsers(userObj);
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
        const user = await NewUsers.findOne({
            $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }],
            password
        });

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
