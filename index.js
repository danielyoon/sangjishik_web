const express = require("express"),
  app = express(),
  cookieParser = require("cookie-parser"),
  cors = require("cors"),
  path = require("path"),
  errorHandler = require("./config/error_handler"),
  server = require("http").createServer(app),
  port = process.env.PORT || 5000;

var environment = process.env.NODE_ENV || "development";

if (environment == "development") require("dotenv").config({ silent: true });

app.use(cookieParser());

app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// API routes
app.use(express.static(path.join(__dirname, "public")));
app.use("/users", require("./controllers/user_controller"));
app.use("/posts", require("./controllers/post_controller"));

// Global Error Handler
app.use(errorHandler);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

server.listen(port, () => {
  console.log(`Listening to port: ${port}`);
});
