import express from "express";

import projectRoutes from "./routes/project.routes.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import authMiddleware from "./middleware/auth.middleware.js";
import projectMemberRoutes from "./routes/projectMember.routes.js";


const app = express();

app.use(express.json());

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user,
  });
});

app.get("/health", (req, res) => {
  res.send("................OK Server is Running On localhost 4000...................");
});

app.use("/api", userRoutes);
app.use("/api", authRoutes);

app.use("/projects", projectRoutes);

app.use(projectMemberRoutes);


export default app;
