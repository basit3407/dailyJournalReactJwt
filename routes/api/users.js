const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const sendEmail = require("../../supportingFunctions/emailVerification");
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

  const { name, email, password } = req.body;

  User.findOne({ email: email }, (err, user) => {
    if (err) return next(err);
    if (user) return res.status(400).json({ email: "user already exists" });

    const newUser = new User({
      email: email,
      name: name,
      password: password,
    });

    // Hash password before saving in database
    bcrypt.genSalt(10, (err, salt) => {
      if (err) return next(err);
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) return next(err);
        newUser.password = hash;
        newUser.save((err) => {
          if (err) next(err);
        });
      });
      //send verification link
      try {
        return sendEmail(req, res);
      } catch (e) {
        next(e);
      }
    });
  });
});

// @route GET api/users/confirm/:email/:token
// @desc Register user
// @access Public

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
    if (!user) return res.status(400).json({ email: "User not found" });
    //check if email is verified
    if (!user.isVerified)
      return res.status(400).json({
        email:
          "your account has not been verified yet.Please click on the link emailed to you to verify your account.",
      });
    // Check password
    bcrypt.compare(password, user.password, (err, success) => {
      if (err) return next(err);
      if (!success)
        return res.status(400).json({ password: "Password incorrect" });

      const { id, name, posts } = user;

      // User matched
      // Create JWT Payload
      const payload = {
        id: id,
        name: name,
        posts: posts,
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
    });
  });
});

// @route GET api/users/:userId/home
// @desc get posts of user
// @access Public

router.get("/:userId/home", (req, res, next) => {
  const { userId } = req.params;

  User.findById(userId, (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(404).json("user doesn't exist");
    res.json(user.posts);
  });
});

// load post routes
const posts = require("./posts");

//load email verification routes
const emailVerification = require("./emailVerification");

router.use("/:userId/posts", posts);
router.use("/confirm", emailVerification);

module.exports = router;
