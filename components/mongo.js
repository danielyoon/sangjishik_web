const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

mongoose.set("strictQuery", true);

module.exports = {
  User: require("../models/user"),
  Post: require("../models/post"),
  RefreshToken: require("../models/refresh_token"),
};
