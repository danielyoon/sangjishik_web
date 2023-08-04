var jwt = require("jsonwebtoken"),
  crypto = require("crypto"),
  bcrypt = require("bcryptjs"),
  sendEmail = require("../components/send_email"),
  db = require("../components/mongo.js");

module.exports = {
  loginWithTokens,
  loginWithEmail,
  forgotPassword,
  sendVerificationEmail,
  createAccount,
  createPost,
  refreshToken,
};

async function loginWithTokens(params, ip) {
  const refreshToken = await getRefreshToken(params.refreshToken);
  const user = refreshToken.user;

  if (refreshToken.isExpired) throw "Token is expired";

  await db.RefreshToken.findOneAndDelete({ user: ObjectId(user.id) });

  const newRefreshToken = generateRefreshToken(user, ip);
  await newRefreshToken.save();

  const jwtToken = generateJwtToken(user);

  return {
    user,
    refreshToken: newRefreshToken.token,
    jwtToken,
  };
}

async function loginWithEmail(params, ip) {
  const user = await db.User.findOne(params.email);

  if (
    !user ||
    !user.isVerified ||
    !bcrypt.compareSync(password, user.passwordHash)
  ) {
    throw "Email or password is incorrect";
  }

  await db.RefreshToken.findOneAndDelete({ user: ObjectId(user.id) });

  const newRefreshToken = generateRefreshToken(user, ip);
  await newRefreshToken.save();

  const jwtToken = generateJwtToken(user);

  return {
    user,
    refreshToken: newRefreshToken.token,
    jwtToken,
  };
}

async function forgotPassword(params) {
  const user = await db.User.findOne(params.email);

  if (!user) return;

  user.resetToken = {
    token: randomTokenString(10),
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };

  await user.save();

  //TODO: Send reset email here
}

async function sendVerificationEmail(params) {}

async function createAccount(params) {}

async function createPost(params) {}

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

async function sendResetPassword() {}
