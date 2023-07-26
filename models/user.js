const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    dateCreated: { type: Date, default: Date.now },
    role: { type: String, enum: ["User", "Admin"], default: "User" },
    email: String,
    passwordHash: String,
  },
  {
    timestamps: true,
    collections: "users",
  }
);

module.exports = mongoose.model("User", schema);
