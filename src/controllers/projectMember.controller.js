import { addMemberByEmail } from "../services/projectMember.service.js";

export async function addProjectMember(req, res) {
  try {
    const { projectId } = req.params;
    const { email } = req.body;

    const ownerId = req.user.id;

    const member = await addMemberByEmail({
      projectId,
      ownerId,
      email,
    });

    return res.status(201).json({
      success: true,
      message: "Member added successfully",
      data: {
        id: member.id,
        userId: member.userId,
        projectId: member.projectId,
        role: member.role,
      },
    });
  } catch (error) {
    
    switch (error.message) {
      case "EMAIL_REQUIRED":
        return res.status(400).json({ error: "Email is required" });

      case "PROJECT_NOT_FOUND":
        return res.status(404).json({ error: "Project not found" });

      case "USER_NOT_FOUND":
        return res.status(400).json({ error: "User with this email does not exist" });

      case "CANNOT_ADD_SELF":
        return res.status(400).json({ error: "Owner cannot be added as a member" });

      case "ALREADY_MEMBER":
        return res.status(409).json({ error: "User is already a project member" });

      default:
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
  }
}
