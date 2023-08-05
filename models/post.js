const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  dateCreated: { type: Date, default: Date.now },
  title: String,
  post: String,
  tags: Array,
  image: String,
});

module.exports = mongoose.model("Post", schema);
