const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- SIGNUP ROUTE ---
router.post('/signup', async (req, res) => {
  try {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) return res.status(400).json({ message: "Email already registered" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role
    });

    const savedUser = await newUser.save();

    // GENERATE TOKEN IMMEDIATELY
    const token = jwt.sign(
      { id: savedUser._id, role: savedUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Send token and user data back
    res.status(201).json({
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        role: savedUser.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Signup failed" });
  }
});


// --- LOGIN ROUTE (The missing piece) ---
router.post('/login', async (req, res) => {
  try {
    // 1. Check if user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Validate Password
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3. Create JSON Web Token
    // Make sure you have JWT_SECRET in your .env file!
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'park_addis_secret_123',
      { expiresIn: "1d" }
    );

    // 4. Send response
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Server error during login" });
  }
});

module.exports = router;