// Load User model
const User = require("../models/User");

// create new post
function addPost(req, res) {
  const {
    body: { title, content },
    params: { userId, p },
  } = req;

  switch (p) {
    //create post with new title or give error if title is duplicate
    case "new":
      User.findById(userId, (err, user) => {
        if (err) throw err;
        else {
          //   check if post title exsists or not.
          const existingPosts = user.posts.find(
            (existingPost) => existingPost.title === title
          );
          if (existingPosts) {
            res.status(409).json({ error: "This post title already existis" });
          } else {
            saveAdd(user);
          }
        }
      });
      break;
    case "duplicate":
      //create post with duplicate title
      User.findById(userId, (err, user) => {
        if (err) throw err;
        else {
          saveAdd(user);
        }
      });
      break;
    default:
      res.status(404);
      break;
  }

  function saveAdd(user) {
    user.posts.push({
      title: title,
      content: content,
    });
    savePost(user, res);
  }
}

// edit post
function editPost(req, res) {
  const {
    body: { title, content },
    params: { userId, p, postId },
  } = req;
  switch (p) {
    //edit post to new title or give error if new title is duplicate
    case "original":
      User.findById(userId, (err, user) => {
        if (err) throw err;
        else {
          //  check if title exists previously
          const existingPosts = user.posts.filter(
            (existingPost) => existingPost.title === title
          );

          //  exclude the title of the selected post
          if (existingPosts.length) {
            const check = existingPosts.filter(
              (existingPost) => !existingPost._id.equals(postId)
            );

            if (check.length) {
              res.status(409).json({ error: "This title already exists" });
            } else {
              saveEdit(user);
            }
          } else {
            saveEdit(user);
          }
        }
      });
      break;
    //edit post and save duplicate titile
    case "duplicate":
      User.findById(userId, (err, user) => {
        if (err) {
          throw err;
        } else {
          saveEdit(user);
        }
      });
      break;
    default:
      res.status(404);
      break;
  }

  function saveEdit(user) {
    const previousPost = user.posts.id(postId);
    previousPost.title = title;
    previousPost.content = content;

    savePost(user, res);
  }
}

function savePost(user, res) {
  user.save((error) => {
    if (error) throw error;
    res.json("post saved");
  });
}

module.exports = { addPost, editPost };
