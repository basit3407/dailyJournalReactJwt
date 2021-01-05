const express = require("express");
const router = express.Router({ mergeParams: true });
const { addPost, editPost } = require("../../supportingFunctions/posts");

// Load input validation
const validatePostInput = require("../../validation/post");

// Load User model
const User = require("../../models/User");

// @route POST api/user/:userId/post/add/:p     p = new|| duplicate
// @desc create new post (if p = new, gives error if title already exists)
// @access Authenticated user
router.post("/add/:p", (req, res, next) => {
  // Form validation
  const { errors, isValid } = validatePostInput(req.body);

  // Check validation
  if (!isValid) return res.status(400).json(errors);

  const { userId, p } = req.params;
  addPost(p, userId, req, res, next);
});

// @route GET api/user/:userId/post/:postId
// @desc send selected post
// @access authenticated user
router.get("/:postId", (req, res, next) => {
  const { userId, postId } = req.params;
  User.findById(userId, (err, user) => {
    if (!err) {
      const selectedPost = user.posts.id(postId);

      selectedPost
        ? res.json(selectedPost)
        : res.status(404).json({ error: "this post doesnt exist" });
    } else next(err);
  });
});

// @route PUT api/user/:userId/post/:postId/:p    p = oriignal || duplicate
// @desc edit post (if p = new, gives error if new title already exists)
// @access Authenticated user
router.put("/:postId/update/:p", (req, res, next) => {
  // Form validation
  const { errors, isValid } = validatePostInput(req.body);

  // Check validation
  if (!isValid) return res.status(400).json(errors);

  const { userId, postId, p } = req.params;
  editPost(p, userId, postId, req, res, next);
});

// @route DELETE api/user/:userId/post/:postId
// @desc delete post
// @access Authenticated user
router.delete("/:postId", (req, res, next) => {
  const { userId, postId } = req.params;

  User.findById(userId, (err, user) => {
    if (!err) {
      const deletedPost = user.posts.id(postId);
      deletedPost.remove();
      user.save((error, user) => (error ? next(error) : res.json(user)));
    } else next(err);
  });
});

module.exports = router;
