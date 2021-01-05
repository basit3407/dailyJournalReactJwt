const express = require("express");
const passport = require("passport");
const keys = require("../config/keys");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.get("/", passport.authenticate("facebook"));

router.get(
  "/DailyJournal",
  passport.authenticate("facebook", {
    session: false,
  }),
  (req, res, next) => {
    //on success send token
    // Create JWT Payload
    const payload = {
      id: req.user._id,
      name: req.user.name,
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
  }
);

module.exports = router;
