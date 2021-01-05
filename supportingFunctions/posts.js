// Load User model
const User = require("../models/User");

// create new post
function addPost(id, userId, req, res, next) {
  switch (id) {
    //create post with new title or give error if title is duplicate
    case "new":
      User.findById(userId, (err, user) => {
        if (!err) {
          //   check if post title exsists or not.
          const existingPosts = user.posts.find(
            (existingPost) => existingPost.title === req.body.title
          );

          if (existingPosts) {
            res.status(409).json({ error: "This post title already existis" });
          } else {
            user.posts.push({
              title: req.body.title,
              content: req.body.content,
            });
            user.save((error, user) =>
              err ? next(error) : res.json(user.posts)
            );
          }
        } else {
          next(err);
        }
      });
      break;
    case "duplicate":
      //create post with duplicate title
      User.findById(userId, (err, user) => {
        if (!err) {
          user.posts.push({
            title: req.body.title,
            content: req.body.content,
          });
          user.save((error, user) => (error ? next(error) : res.json(user)));
        } else {
          next(err);
        }
      });
      break;
    default:
      res.status(404);
      break;
  }
}

// edit post
function editPost(id, userId, postId, req, res, next) {
  switch (id) {
    //edit post to new title or give error if new title is duplicate
    case "original":
      User.findById(userId, (err, user) => {
        if (!err) {
          //  check if title exists previously
          const existingPosts = user.posts.filter(
            (existingPost) => existingPost.title === req.body.title
          );

          //  exclude the title of the selected post
          if (existingPosts.length) {
            const check = existingPosts.filter(
              (existingPost) => !existingPost._id.equals(postId)
            );

            if (check.length) {
              res.status(409).json({ error: "This title already exists" });
            } else {
              const previousPost = user.posts.id(postId);
              previousPost.title = req.body.title;
              previousPost.content = req.body.content;

              user.save((error, user) =>
                error ? next(error) : res.json(user)
              );
            }
          } else {
            const previousPost = user.posts.id(postId);
            previousPost.title = req.body.title;
            previousPost.content = req.body.content;

            user.save((error, user) =>
              error ? next(error, user) : res.json(user)
            );
          }
        } else {
          next(err);
        }
      });
      break;
    //edit post and save duplicate titile
    case "duplicate":
      User.findById(userId, (err, user) => {
        if (!err) {
          const previousPost = user.posts.id(postId);

          previousPost.title = req.body.title;
          previousPost.content = req.body.content;

          user.save((error, user) => (error ? next(error) : res.json(user)));
        }
      });
      break;
    default:
      res.status(404);
      break;
  }
}

module.exports = { addPost, editPost };
