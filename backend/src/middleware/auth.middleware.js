import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: {
        code: "NO_TOKEN_PROVIDED",
        message: "No token provided",
      },
    });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2) {
    return res.status(401).json({
      success: false,
      error: {
        code: "TOKEN_FORMAT_ERROR",
        message: "Invalid Authorization header format",
      },
    });
  }

  const [scheme, token] = parts;

  if (scheme !== "Bearer") {
    return res.status(401).json({
      success: false,
      error: {
        code: "TOKEN_SCHEME_INVALID",
        message: "Authorization scheme must be Bearer",
      },
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 THIS LINE IS THE FIX
    req.user = { id: decoded.id };

    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: {
        code: "TOKEN_INVALID",
        message: "Invalid or expired token",
      },
    });
  }
}
