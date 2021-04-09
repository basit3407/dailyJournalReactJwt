// Load User model
const User = require("../models/User");

// create new post
function addPost(req, res) {
  const {
    body: { title, content, date },
    params: { userId, p },
  } = req;

  switch (p) {
    //create post with new title or give error if title is duplicate
    case "new":
      User.findById(userId, (err, user) => {
        if (err) throw err;
        //   check if post title exsists or not.
        const existingPosts = user.posts.find(
          (existingPost) => existingPost.title === title
        );
        if (existingPosts)
          return res
            .status(409)
            .json({ error: "This post title already existis" });

        saveAdd(user);
      });
      break;
    case "duplicate":
      //create post with duplicate title
      User.findById(userId, (err, user) => {
        if (err) throw err;
        saveAdd(user);
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
      date: date,
    });
    savePost(user, res);
  }
}

// edit post
function editPost(req, res) {
  const {
    body: { title, content, date },
    params: { userId, p, postId },
  } = req;
  switch (p) {
    //edit post to new title or give error if new title is duplicate
    case "original":
      User.findById(userId, (err, user) => {
        if (err) throw err;
        //  check if title exists previously
        const existingPosts = user.posts.filter(
          (existingPost) => existingPost.title === title
        );
        //  exclude the title of the selected post
        if (existingPosts.length) {
          const check = existingPosts.filter(
            (existingPost) => !existingPost._id.equals(postId)
          );

          if (check.length)
            return res
              .status(409)
              .json({ postAlreadyExist: "This post title already exists" });
        }
        saveEdit(user);
      });
      break;
    //edit post and save duplicate titile
    case "duplicate":
      User.findById(userId, (err, user) => {
        if (err) throw err;
        saveEdit(user);
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
    previousPost.date = date;

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
