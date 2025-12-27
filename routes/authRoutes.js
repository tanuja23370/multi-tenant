const express = require("express");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");

const router = express.Router();

/**
 * REGISTER USER
 */
router.post("/register", async (req, res) => {
  try {
    const { email, mobile, password } = req.body;

    // 1. Validate
    if (!email || !mobile || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // 2. Validate mobile number (10 digits only)
    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ message: "Mobile number must be exactly 10 digits" });
    }

    // 3. Check existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email or mobile"
      });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Generate unique user ID
    const userId = uuidv4();

    // 5. Create user
    const newUser = new User({
      userId,
      email,
      mobile,
      password: hashedPassword
    });

    await newUser.save();

    // 6. Create session
    req.session.userId = newUser.userId;
    req.session.email = newUser.email;
    req.session.mobile = newUser.mobile;

    res.status(201).json({
      message: "User registered successfully",
      userId: newUser.userId,
      email: newUser.email,
      mobile: newUser.mobile
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * LOGIN USER
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // 2. Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 4. Create session
    req.session.userId = user.userId;
    req.session.email = user.email;
    req.session.mobile = user.mobile;

    res.status(200).json({
      message: "Login successful",
      userId: user.userId,
      email: user.email,
      mobile: user.mobile
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET CURRENT USER
 */
router.get("/user", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findOne({ userId: req.session.userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      userId: user.userId,
      email: user.email,
      mobile: user.mobile
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * LOGOUT USER
 */
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.status(200).json({ message: "Logout successful" });
  });
});

module.exports = router;
