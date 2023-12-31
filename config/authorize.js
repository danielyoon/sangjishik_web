const { expressjwt: jwt } = require("express-jwt");
const secret = process.env.SECRET_OR_KEY;
const db = require("../components/mongo");

module.exports = authorize;

function authorize(roles = []) {
  if (typeof roles === "string") {
    roles = [roles];
  }

  return [
    jwt({
      secret,
      algorithms: ["HS256"],
    }),

    async (req, res, next) => {
      const user = await db.User.findById(req.auth.id);

      if (!user || (roles.length && !roles.includes(user.role))) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      req.auth.role = user.role;
      const refreshTokens = await db.RefreshToken.find({
        user: user.id,
      });
      req.auth.ownsToken = (token) =>
        !!refreshTokens.find((x) => x.token === token);
      next();
    },
  ];
}
