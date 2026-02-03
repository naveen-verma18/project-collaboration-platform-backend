const express = require("express");
const userRoutes = require("./routes/user.routes");
const authRoutes  = require("./routes/auth.routes");
const authMiddleware = require("./middleware/auth.middleware");

const app = express();
app.use(express.json());

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user,
  });
});

app.get("/health", (req, res) => {
  res.send("OK");
});

app.use("/api", userRoutes);
app.use("/api",authRoutes);

module.exports = app;
