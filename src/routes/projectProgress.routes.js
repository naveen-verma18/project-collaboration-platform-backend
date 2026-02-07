import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { getProjectProgress } from "../controllers/projectProgress.controller.js";

const router = express.Router();

router.get(
  "/projects/:projectId/progress",
  authenticate,
  getProjectProgress
);

export default router;
