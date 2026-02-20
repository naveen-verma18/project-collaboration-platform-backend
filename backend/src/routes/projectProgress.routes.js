import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { getProjectProgress } from "../controllers/projectProgress.controller.js";

const router = express.Router();

router.get(
  "/projects/:projectId/progress",
  authMiddleware,
  getProjectProgress
);

export default router;
