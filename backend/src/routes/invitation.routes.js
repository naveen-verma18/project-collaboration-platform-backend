import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  createInvitationController,
  getMyInvitationsController,
  acceptInvitationController,
  rejectInvitationController,
} from "../controllers/invitation.controller.js";

const router = express.Router();

// Create invitation for a project (OWNER only)
router.post(
  "/projects/:projectId/invitations",
  authMiddleware,
  createInvitationController
);

// Get invitations for logged in user
router.get("/invitations", authMiddleware, getMyInvitationsController);

// Accept / Reject
router.patch(
  "/invitations/:id/accept",
  authMiddleware,
  acceptInvitationController
);
router.patch(
  "/invitations/:id/reject",
  authMiddleware,
  rejectInvitationController
);

export default router;

