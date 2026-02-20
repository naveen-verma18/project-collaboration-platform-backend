import express from "express";
import { getProjectActivitiesController } from "../controllers/activity.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/projects/:projectId/activity", authMiddleware, getProjectActivitiesController);

export default router;
