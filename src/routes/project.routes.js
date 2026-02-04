import express from "express";
import { createProjectController } from "../controllers/project.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { getMyProjectsController } from "../controllers/project.controller.js";
const router = express.Router();

router.get("/", authMiddleware, getMyProjectsController);
router.post("/", authMiddleware, createProjectController);

export default router;
