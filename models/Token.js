const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  expireAt: { type: Date, default: Date.now, index: { expires: 86400 } }, //01 day in seconds
});

const Token = mongoose.model("tokens", tokenSchema);
module.exports = Token;
