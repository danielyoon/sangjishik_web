var db = require("../components/mongo.js");

module.exports = {
  createPost,
  getPosts,
};

async function createPost(params) {
  console.log(params);

  const documentCount = await db.Post.countDocuments();

  var post = new db.Post({
    count: documentCount + 1,
    title: params.title,
    post: params.post,
    tags: params.tags,
    image: params.image,
    likes: 0,
  });

  await post.save();

  return { status: "SUCCESS", data: post };
}

async function getPosts() {
  const posts = await db.Post.find({}).sort({ dateCreated: -1 }).select("-__v");

  return posts;
}
