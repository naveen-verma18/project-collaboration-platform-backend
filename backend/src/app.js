import express from "express";
import cors from "cors";

import projectRoutes from "./routes/project.routes.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import authMiddleware from "./middleware/auth.middleware.js";
import projectMemberRoutes from "./routes/projectMember.routes.js";
import taskRoutes from "./routes/task.routes.js";
import goalRoutes from "./routes/goal.routes.js";
import decisionRoutes from "./routes/decision.routes.js";
import documentRoutes from "./routes/document.routes.js";
import projectProgressRoutes from "./routes/projectProgress.routes.js";
import activityRoutes from "./routes/activity.routes.js";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Health
app.get("/health", (req, res) => {
  res.send("OK Server is Running On localhost 4000");
});

// Protected test route
app.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user,
  });
});

// Auth + Users (NO /api prefix now)
app.use(authRoutes);
app.use(userRoutes);

// Projects
app.use("/projects", projectRoutes);

// Members
app.use(projectMemberRoutes);

// Features
app.use(taskRoutes);
app.use(goalRoutes);
app.use(decisionRoutes);
app.use(documentRoutes);
app.use(projectProgressRoutes);
app.use(activityRoutes);

export default app;