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
    data: {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        dateCreated: user.dateCreated,
      },
      refreshToken: newRefreshToken.token,
      jwtToken,
    },
  };
}

async function loginWithEmail(params, ip) {
  const { email, password } = params;

  const user = await db.User.findOne({ email: email });

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
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        dateCreated: user.dateCreated,
      },
      refreshToken: newRefreshToken.token,
      jwtToken,
    },
  };
}

async function forgotPassword(params) {
  const user = await db.User.findOne({ email: params.email });

  if (!user)
    return {
      status: "NONEXISTENT",
    };

  if (user) {
    if (!user.verified) {
      return { status: "WRONG" };
    }
  }

  user.resetToken = {
    token: randomTokenString(10),
    expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
  };

  await user.save();

  sendResetTokenEmail(user);

  return {
    status: "SUCCESS",
  };
}

async function verifyToken(params) {
  const user = await db.User.findOne({ email: params.email });

  if (!user) {
    return { status: "NONEXISTENT" };
  }

  if (
    user.resetToken &&
    user.resetToken.token === params.token &&
    user.resetToken.expires > Date.now()
  ) {
    if (!user.isVerified) {
      user.verified = Date.now();
      await user.save();
    }
    return { status: "SUCCESS" };
  }

  return { status: "WRONG" };
}

async function updatePassword(params, ipAddress) {
  let user = await db.User.findOne({ email: params.email });

  if (!user || !user.verified) {
    return { status: "UNVERIFIED" };
  }

  params.passwordHash = hash(params.password);

  const isFirstUser =
    (await db.User.countDocuments({ verified: { $ne: null } })) === 1;
  user.role = isFirstUser ? "Admin" : "User";

  Object.assign(user, params);
  await user.save();

  await db.RefreshToken.findOneAndDelete({ user: ObjectId(user.id) });

  console.log(ipAddress);

  const newRefreshToken = generateRefreshToken(user, ipAddress);
  await newRefreshToken.save();

  console.log(newRefreshToken.token);

  const jwtToken = generateJwtToken(user);

  console.log(jwtToken);

  return {
    status: "SUCCESS",
    data: {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        dateCreated: user.dateCreated,
      },
      refreshToken: newRefreshToken.token,
      jwtToken,
    },
  };
}

async function sendVerificationEmail(params) {
  let user = await db.User.findOne({ email: params.email });

  if (!user || user.isVerified) {
    return {
      status: "FAILURE",
      message: user ? "User is already verified." : "User does not exist.",
    };
  }

  const verificationToken = randomTokenString(10);

  user.resetToken = {
    token: verificationToken,
    expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
  };

  await user.save();

  await sendVerificationCode(user);

  return { status: "SUCCESS" };
}

async function createAccount(params) {
  let user = await db.User.findOne({ email: params.email });

  if (user) {
    if (user.verified) {
      return { status: "WRONG" };
    }

    await db.User.deleteOne({ email: params.email });
  }

  const verificationToken = randomTokenString(10);
  user = new db.User({
    email: params.email,
    resetToken: {
      token: verificationToken,
      expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
  });

  await user.save();
  sendVerificationCode(user);

  return { status: "SUCCESS" };
}

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

function hash(password) {
  return bcrypt.hashSync(password, 10);
}

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
  if (!refreshToken || refreshToken.isExpired) throw "Invalid token";
  return refreshToken;
}

function randomTokenString(number) {
  return crypto.randomBytes(number).toString("hex");
}

async function sendVerificationCode(user) {
  let message;
  message = `<p>Please use the below token to verify your email:</p>
               <p><code>${user.resetToken.token}</code></p>`;

  await sendEmail({
    to: user.email,
    subject: "Verify Email",
    html: `<h4>Verify Email</h4>${message}`,
  });
}

async function sendResetTokenEmail(user) {
  let message;
  message = `<p>Please use the below token to reset your password:</p>
               <p><code>${user.resetToken.token}</code></p>`;

  await sendEmail({
    to: user.email,
    subject: "Reset Password",
    html: `<h4>Reset Password Email</h4>${message}`,
  });
}
