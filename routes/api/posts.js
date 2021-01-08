const express = require("express");
const router = express.Router({ mergeParams: true });
const { addPost, editPost } = require("../../supportingFunctions/posts");

// Load input validation
const validatePostInput = require("../../validation/post");

// Load User model
const User = require("../../models/User");

// @route POST api/user/:userId/posts/add/:p     p = new|| duplicate
// @desc create new post (if p = new, gives error if title already exists)
// @access Authenticated user
router.post("/add/:p", (req, res, next) => {
  // Form validation
  const { errors, isValid } = validatePostInput(req.body);

  // Check validation
  if (!isValid) return res.status(400).json(errors);

  const { userId, p } = req.params;
  try {
    addPost(p, userId, req, res);
  } catch (e) {
    next(e);
  }
});

// @route PUT api/users/:userId/post/:postId/:p    p = original || duplicate
// @desc edit post (if p = new, gives error if new title already exists)
// @access Authenticated user
router.put("/:postId/update/:p", (req, res, next) => {
  // Form validation
  const { errors, isValid } = validatePostInput(req.body);

  // Check validation
  if (!isValid) return res.status(400).json(errors);

  const { userId, postId, p } = req.params;
  try {
    editPost(p, userId, postId, req, res);
  } catch (e) {
    next(e);
  }
});

// @route DELETE api/users/:userId/post/:postId
// @desc delete post
// @access Authenticated user
router.delete("/:postId", (req, res, next) => {
  const { userId, postId } = req.params;

  User.findById(userId, (err, user) => {
    if (!err) {
      const deletedPost = user.posts.id(postId);
      deletedPost.remove();
      user.save((error, user) => (error ? next(error) : res.json(user.posts)));
    } else next(err);
  });
});

module.exports = router;
