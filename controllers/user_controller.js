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
router.post("/create-post", authorize(Role.Admin), createPost);

router.post("/refresh-token", refreshToken);

module.exports = router;

function loginWithTokens(req, res, next) {}

function loginWithEmail(req, res, next) {}

function forgotPassword(req, res, next) {}

function sendVerificationEmail(req, res, next) {}

function createAccount(req, res, next) {}

function createPost(req, res, next) {}
