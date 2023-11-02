var jwt = require("jsonwebtoken"),
  crypto = require("crypto"),
  bcrypt = require("bcryptjs"),
  sendEmail = require("../components/send_email"),
  db = require("../components/mongo.js");

module.exports = {
  loginWithTokens,
  loginWithEmail,
  forgotPassword,
  verifyToken,
  updatePassword,
  sendVerificationEmail,
  createAccount,
  // createPost,
  refreshToken,
};

async function loginWithTokens(params, ip) {
  const refreshToken = await getRefreshToken(params.refreshToken);
  const user = refreshToken.user;

  if (refreshToken.isExpired) {
    return {
      status: "EXPIRED",
      data: null,
    };
  }

  await db.RefreshToken.findOneAndDelete({ user: ObjectId(user.id) });

  const newRefreshToken = generateRefreshToken(user, ip);
  await newRefreshToken.save();

  const jwtToken = generateJwtToken(user);

  return {
    stats: "SUCCESS",
    data: { user, refreshToken: newRefreshToken.token, jwtToken },
  };
}

async function loginWithEmail(params, ip) {
  const { email, password } = params;

  const user = await db.User.findOne({ email });

  if (!user) {
    return {
      status: "NONEXISTENT",
      data: null,
    };
  }

  if (!user.isVerified || !bcrypt.compareSync(password, user.passwordHash)) {
    return {
      status: "WRONG",
      data: null,
    };
  }

  await db.RefreshToken.findOneAndDelete({ user: ObjectId(user.id) });

  const newRefreshToken = generateRefreshToken(user, ip);
  await newRefreshToken.save();

  const jwtToken = generateJwtToken(user);

  return {
    status: "SUCCESS",
    data: {
      user,
      refreshToken: newRefreshToken.token,
      jwtToken,
    },
  };
}

async function forgotPassword(params, ip) {
  console.log(params);

  const user = await db.User.findOne(params.email);

  if (!user)
    return {
      status: "NONEXISTENT",
    };

  user.resetToken = {
    token: randomTokenString(10),
    expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
  };

  await user.save();

  sendResetTokenEmail(user, ip);

  return {
    status: "SUCCESS",
  };
}

async function verifyToken(params) {}

async function updatePassword(params) {}

async function sendVerificationEmail(params) {}

async function createAccount(params) {}

// async function createPost(params) {
//   const count = await db.Post.countDocuments();
//   const id = `${count + 1}`;

//   const post = new db.Post({
//     id: id,
//     title: params.title,
//     post: params.post,
//     tags: convertStringToArray(params.tags),
//     image: params.image,
//   });

//   await post.save();

//   return post;
// }

async function refreshToken(params) {}

function generateJwtToken(user) {
  return jwt.sign({ sub: user.id, id: user.id }, process.env.SECRET_OR_KEY, {
    expiresIn: "24h",
  });
}

/// Token expires after 2 days
function generateRefreshToken(user, ipAddress) {
  return new db.RefreshToken({
    user: user.id,
    token: randomTokenString(40),
    expires: new Date(Date.now() + 2 * 24 * 60 * 1000),
    createdByIp: ipAddress,
  });
}

async function getRefreshToken(token) {
  const refreshToken = await db.RefreshToken.findOne({ token }).populate(
    "user"
  );
  if (!refreshToken || !refreshToken.isActive) throw "Invalid token";
  return refreshToken;
}

function randomTokenString(number) {
  return crypto.randomBytes(number).toString("hex");
}

async function sendVerificationCode() {}

async function sendResetTokenEmail(user, origin) {
  let message;
  message = `<p>Please use the below token to reset your password:</p>
               <p><code>${user.resetToken.token}</code></p>`;

  await sendEmail({
    to: user.email,
    subject: "Reset Password",
    html: `<h4>Reset Password Email</h4>${message}`,
  });
}
