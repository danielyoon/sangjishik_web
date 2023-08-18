const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  id: Number,
  dateCreated: { type: Date, default: Date.now },
  title: String,
  post: String,
  tags: Array,
  image: String,
  likes: int,
  comments: { type: Array, default: [] },
});

module.exports = mongoose.model("Post", schema);
