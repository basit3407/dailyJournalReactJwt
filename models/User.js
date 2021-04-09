const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Post Schema
const postSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
  },
});

// Create User Schema
const UserSchema = new Schema({
  isVerified: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  googleId: String,
  facebookId: String,
  posts: [postSchema],
});

const User = mongoose.model("users", UserSchema);
module.exports = User;
