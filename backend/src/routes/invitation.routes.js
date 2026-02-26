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

// Get pending invitations for logged in user (new canonical route)
router.get("/invites/pending", authMiddleware, getMyInvitationsController);

// Backwards-compatible route used by existing frontend
router.get("/users/invites", authMiddleware, getMyInvitationsController);

// Accept / Reject
router.post(
  "/invites/:id/accept",
  authMiddleware,
  acceptInvitationController
);
router.post(
  "/invites/:id/reject",
  authMiddleware,
  rejectInvitationController
);

export default router;

