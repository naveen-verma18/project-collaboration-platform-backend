import express from "express";

import projectRoutes from "./routes/project.routes.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import authMiddleware from "./middleware/auth.middleware.js";

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
app.use("/api", authRoutes);

app.use("/projects", projectRoutes);

export default app;
