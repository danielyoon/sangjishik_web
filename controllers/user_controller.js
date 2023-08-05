var express = require("express"),
  router = express.Router(),
  authorize = require("../config/authorize"),
  Role = require("../components/role"),
  userService = require("../services/user_service");

router.post("/login-with-tokens", loginWithTokens);
router.post("/login-with-email", loginWithEmail);
router.post("/forgot-password", forgotPassword);
router.post("/send-verification-email", sendVerificationEmail);
router.post("/create-account", createAccount);
router.post("/create-post", createPost);

router.post("/refresh-token", refreshToken);

module.exports = router;

function loginWithTokens(req, res, next) {
  userService
    .loginWithTokens(req.body, req.ip)
    .then((status) => res.json(status))
    .catch(next);
}

function loginWithEmail(req, res, next) {
  userService
    .loginWithEmail(req.body, req.ip)
    .then((status) => res.json(status))
    .catch(next);
}

function forgotPassword(req, res, next) {
  userService
    .forgotPassword(req.body)
    .then(() => res.sendStatus(200))
    .catch(next);
}

function sendVerificationEmail(req, res, next) {
  userService
    .sendVerificationEmail(req.body)
    .then(() => res.sendStatus(200))
    .catch(next);
}

function createAccount(req, res, next) {
  userService
    .createAccount(req.body, req.ip)
    .then((status) => res.json(status))
    .catch(next);
}

function createPost(req, res, next) {
  print(req.body);

  // userService
  //   .createPost(req.body)
  //   .then((status) => res.json(status))
  //   .catch(next);
}

function refreshToken(req, res, next) {}
