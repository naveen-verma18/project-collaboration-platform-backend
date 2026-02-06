import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { addProjectMember } from "../controllers/projectMember.controller.js";

const router = express.Router();

router.post(
  "/projects/:projectId/members",
  authMiddleware,
  addProjectMember
);

export default router;
