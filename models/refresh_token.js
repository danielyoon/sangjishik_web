const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  token: String,
  created: { type: Date, default: Date.now },
  createdByIp: String,
  expireAt: { type: Date, default: Date.now() },
});

schema.virtual("isExpired").get(function () {
  return Date.now() >= this.expireAt;
});

schema.virtual("isActive").get(function () {
  return !this.isExpired;
});

schema.index({ expireAt: 1 }, { expireAfterSeconds: 172800 });

module.exports = mongoose.model("RefreshToken", schema);
