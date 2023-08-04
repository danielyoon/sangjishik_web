const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    dateCreated: { type: Date, default: Date.now },
    role: { type: String, enum: ["User", "Admin"], default: "User" },
    email: String,
    passwordHash: String,
    verified: Date,
    resetToken: {
      token: String,
      expires: Date,
    },
    nickname: String,
  },
  {
    timestamps: true,
    collections: "users",
  }
);

schema.virtual("isVerified").get(function () {
  return !!this.verified;
});

module.exports = mongoose.model("User", schema);
