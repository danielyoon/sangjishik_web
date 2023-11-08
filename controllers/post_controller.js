var express = require("express"),
  router = express.Router(),
  authorize = require("../config/authorize"),
  Role = require("../components/role"),
  postService = require("../services/post_service");

router.post("/create-post", authorize(Role.Admin), createPost);
router.get("/get-posts", getPosts);

module.exports = router;

function createPost(req, res, next) {
  postService
    .createPost(req.body)
    .then((result) => {
      if (result.status === "SUCCESS") {
        res.json(result.data);
      } else {
        res.status(404).send("Invalid post");
      }
    })
    .catch(next);
}

function getPosts(req, res, next) {
  postService
    .getPosts()
    .then((result) => {
      res.json(result);
    })
    .catch(next);
}
