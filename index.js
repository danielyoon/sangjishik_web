const express = require("express"),
  app = express(),
  cookieParser = require("cookie-parser"),
  cors = require("cors"),
  errorHandler = require("./config/error_handler"),
  server = require("http").createServer(app),
  port = process.env.PORT || 5000;

var environment = process.env.NODE_ENV || "development";

if (environment == "development") require("dotenv").config({ silent: true });

app.use(cookieParser());

// allow cors requests from any origin and with credentials
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// api routes
app.use("/users", require("./controllers/user_controller"));

// global error handler
app.use(errorHandler);

server.listen(port, () => {
  console.log(`Listening to port: ${port}`);
});
