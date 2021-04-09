const express = require("express");
const router = express.Router();

//Load Token model
const Token = require("../../models/Token");
// Load User model
const User = require("../../models/User");
const sendEmail = require("../../supportingFunctions/emailVerification");

// @route POST api/users/confirm/
// @desc send email verification link
// @access Public

router.post("/", (req, res, next) => {
  const { email } = req.body;

  User.findOne({ email: email }, (err, user) => {
    if (err) next(err);
    if (!user) return res.status(400).json({ email: "user doesnt exist" });
    if (user.isVerified)
      return res
        .status(200)
        .json({ success: "This account has already been verified" });
    //send verification link
    try {
      sendEmail(req, res);
    } catch (e) {
      next(e);
    }
  });
});

// @route GET api/users/confirm/:email/:token
// @desc verify email address
// @access Public
router.get("/:email/:token", (req, res, next) => {
  const { email, token } = req.params;
  Token.findOne({ token: token }, (err, token) => {
    if (err) return next(err);
    // token is not found into database i.e. token may have expired
    if (!token)
      return sendResponse(
        "failed",
        "your token may have expired,please click on resend"
      );

    // if token is found then check valid user
    User.findOne({ email: email }, (err, user) => {
      if (err) return next(err);
      //not valid user
      if (!user)
        return sendResponse(
          "failed",
          "We were unable to find a user for this verification. Please SignUp!"
        );
      if (user.isVerified)
        return sendResponse(
          "failed",
          "User has been already verified. Please Login"
        );

      //change is verified to true
      user.isVerified = true;
      user.save((err) => {
        err
          ? next(err)
          : sendResponse(
              "success",
              "your account has been verified successfully.You may proceed to login"
            );
      });
    });
  });
  const sendResponse = (status, message) => {
    return res.redirect(
      `http://localhost:3000/email?message=${message}&status=${status}&email=${email}`
    );
  };
});

module.exports = router;
