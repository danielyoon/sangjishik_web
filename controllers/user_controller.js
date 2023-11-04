var express = require("express"),
  router = express.Router(),
  authorize = require("../config/authorize"),
  Role = require("../components/role"),
  { LOGIN } = require("../components/enums"),
  userService = require("../services/user_service");

router.post("/login-with-token", loginWithTokens);
router.post("/login-with-email", loginWithEmail);
router.post("/forgot-password", forgotPassword);
router.post("/verify-token", verifyToken);
router.post("/update-password", updatePassword);
router.post("/send-verification-email", sendVerificationEmail);
router.post("/create-account", createAccount);
// router.post("/create-post", authorize(Role.Admin), createPost);

router.post("/refresh-token", refreshToken);

module.exports = router;

function loginWithTokens(req, res, next) {
  userService
    .loginWithTokens(req.body, req.ip)
    .then((result) => {
      if (result.status === LOGIN.SUCCESS) {
        res.json(result.data);
      } else {
        res.status(404).send("Expired token");
      }
    })
    .catch(next);
}

function loginWithEmail(req, res, next) {
  userService
    .loginWithEmail(req.body, req.ip)
    .then((result) => {
      console.log(result.status);
      if (result.status === LOGIN.SUCCESS) {
        res.json(result.data);
      } else {
        switch (result.status) {
          case LOGIN.WRONG:
            res.status(401).send("Wrong password");
            break;
          case LOGIN.NONEXISTENT: {
            console.log("Should be here");
            res.status(404).send("Email not found");
            break;
          }
        }
      }
    })
    .catch(next);
}

function forgotPassword(req, res, next) {
  userService
    .forgotPassword(req.body)
    .then((result) => {
      if (result.status === LOGIN.SUCCESS) {
        res.sendStatus(200);
      } else {
        res.status(404).send("Nonexistent email");
      }
    })
    .catch(next);
}

function verifyToken(req, res, next) {
  userService
    .verifyToken(req.body)
    .then((result) => {
      if (result.status === LOGIN.SUCCESS) {
        res.sendStatus(200);
      } else {
        res.status(404).send("Wrong token");
      }
    })
    .catch(next);
}

function updatePassword(req, res, next) {
  userService
    .updatePassword(req.body)
    .then((result) => {
      if (result.status === LOGIN.SUCCESS) {
        res.json(result.data);
      } else {
        res.status(404).send("Unverified");
      }
    })
    .catch(next);
}

function sendVerificationEmail(req, res, next) {
  userService
    .sendVerificationEmail(req.body)
    .then((result) => {
      if (result.status === LOGIN.SUCCESS) {
        res.sendStatus(200);
      } else {
        res.status(404).send("Nonexistent email");
      }
    })
    .catch(next);
}

function createAccount(req, res, next) {
  userService
    .createAccount(req.body, req.ip)
    .then((result) => {
      if (result.status === LOGIN.SUCCESS) {
        res.json(result.data);
      } else {
        res.status(404).send("Already existing email");
      }
    })
    .catch(next);
}

function refreshToken(req, res, next) {}

// function createPost(req, res, next) {
//   userService
//     .createPost(req.body)
//     .then((status) => res.json(status))
//     .catch(next);
// }
