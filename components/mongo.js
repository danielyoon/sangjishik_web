const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, function (err, db) {
  if (err) throw err;
  console.log("Connected to MongoDB!");
});

mongoose.set("strictQuery", true);

module.exports = {
  User: require("../models/user"),
  RefreshToken: require("../models/refresh_token"),
};
