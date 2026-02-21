import {
  createInvitation,
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
} from "../services/invitation.service.js";

export const createInvitationController = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email } = req.body;
    const ownerId = req.user.id;

    const invitation = await createInvitation({
      projectId,
      ownerId,
      email,
    });

    return res.status(201).json({
      success: true,
      data: invitation,
    });
  } catch (error) {
    switch (error.message) {
      case "EMAIL_REQUIRED":
        return res.status(400).json({
          success: false,
          error: {
            code: "EMAIL_REQUIRED",
            message: "Email is required",
          },
        });
      case "PROJECT_NOT_FOUND":
        return res.status(404).json({
          success: false,
          error: {
            code: "PROJECT_NOT_FOUND",
            message: "Project not found or you are not the owner",
          },
        });
      case "USER_NOT_FOUND":
        return res.status(404).json({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User with this email does not exist",
          },
        });
      case "ALREADY_MEMBER":
        return res.status(409).json({
          success: false,
          error: {
            code: "ALREADY_MEMBER",
            message: "User is already a project member",
          },
        });
      default:
        console.error(error);
        return res.status(500).json({
          success: false,
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal server error",
          },
        });
    }
  }
};

export const getMyInvitationsController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const invitations = await getMyInvitations({ userId });

    res.json({
      success: true,
      data: invitations,
    });
  } catch (error) {
    next(error);
  }
};

export const acceptInvitationController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const invitation = await acceptInvitation({
      invitationId: id,
      userId,
    });

    res.json({
      success: true,
      data: invitation,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectInvitationController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const invitation = await rejectInvitation({
      invitationId: id,
      userId,
    });

    res.json({
      success: true,
      data: invitation,
    });
  } catch (error) {
    next(error);
  }
};

