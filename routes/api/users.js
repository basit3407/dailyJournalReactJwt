const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
// Load User model
const User = require("../../models/User");

// @route POST api/users/register
// @desc Register user
// @access Public

router.post("/register", (req, res, next) => {
  // Form validation
  const { errors, isValid } = validateRegisterInput(req.body);
  // Check validation
  if (!isValid) return res.status(400).json(errors);

  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) return next(err);
    if (user) return res.status(400).json({ email: "User already exists" });

    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    // Hash password before saving in database
    bcrypt.genSalt(10, (err, salt) => {
      if (err) return next(err);
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) return next(err);
        newUser.password = hash;
        newUser.save((err) => (err ? next(err) : res.json("user added")));
      });
    });
  });
});

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/login", (req, res, next) => {
  // Form validation
  const { errors, isValid } = validateLoginInput(req.body);
  // Check validation
  if (!isValid) return res.status(400).json(errors);

  const { email, password } = req.body;

  // Find user by email
  User.findOne({ email: email }, (err, user) => {
    if (err) return next(err);
    // Check if user exists
    if (!user) return res.status(404).json({ email: "User not found" });
    // Check password
    bcrypt.compare(password, user.password, (err, success) => {
      if (err) return next(err);
      if (success) {
        // User matched
        // Create JWT Payload
        const payload = {
          id: user._id,
          name: user.name,
          posts: user.posts,
        };
        //sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          {
            expiresIn: 31556926, // 1 year in seconds
          },
          (err, token) => {
            if (err) return next(err);
            res.json({ success: true, token: `Bearer ${token}` });
          }
        );
      } else return res.status(400).json({ password: "Password incorrect" });
    });
  });
});

// load post routes
const posts = require("./posts");

router.use("/:userId/posts", posts);

module.exports = router;
