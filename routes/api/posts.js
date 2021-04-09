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

  try {
    addPost(req, res);
  } catch (e) {
    next(e);
  }
});

// @route GET api/user/:userId/posts/:postId
// @desc get post
// @access Authenticated user

router.get("/:postId", (req, res, next) => {
  const { userId, postId } = req.params;
  User.findById(userId, (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(404).json("user doesn't exist");

    const post = user.posts.id(postId);
    if (!post) return res.status(404).json("post doesn't exist");
    res.json(user.posts.id(postId));
  });
});

// @route PUT api/users/:userId/post/:postId/:p    p = original || duplicate
// @desc edit post (if p = new, gives error if new title already exists)
// @access Authenticated user
router.put("/:postId/update/:p", (req, res, next) => {
  // Form validation
  const { errors, isValid } = validatePostInput(req.body);

  // Check validation
  if (!isValid) return res.status(400).json(errors);

  try {
    editPost(req, res);
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
    if (err) return next(err);

    const deletedPost = user.posts.id(postId);
    deletedPost.remove();
    user.save((error) => (error ? next(error) : res.json("user deleted")));
  });
});

module.exports = router;
