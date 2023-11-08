const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  count: { type: Number, required: true },
  dateCreated: { type: Date, default: Date.now },
  title: { type: String, required: true },
  post: { type: String, required: true },
  tags: { type: String, required: true },
  image: { type: String, required: true },
  likes: Number,
  comments: { type: Array, default: [] },
});

module.exports = mongoose.model("Post", schema);
