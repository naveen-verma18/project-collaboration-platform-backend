import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { addProjectMember } from "../controllers/projectMember.controller.js";
import { removeProjectMember } from "../controllers/projectMember.controller.js";
import { changeProjectMemberRole } from "../controllers/projectMember.controller.js";

const router = express.Router();



router.patch(
  "/projects/:projectId/members/:memberId/role",
  authMiddleware,
  changeProjectMemberRole
);


router.post(
  "/projects/:projectId/members",
  authMiddleware,
  addProjectMember
);

router.delete(
    "/projects/:projectId/members/:memberId",
    authMiddleware,
    removeProjectMember
  );

export default router;
