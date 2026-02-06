import { createProject } from "../services/project.service.js";
import { getMyProjects } from "../services/project.service.js";
import { getProjectById } from "../services/project.service.js";
import { updateProject } from "../services/project.service.js";
import { deleteProject } from "../services/project.service.js";



export async function createProjectController(req, res, next) {
  try {
    const userId = req.user.id;
    const { name, description } = req.body;

    const project = await createProject({
      userId,
      name,
      description,
    });

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyProjectsController(req, res, next) {
  try {
    const userId = req.user.id;

    const projects = await getMyProjects(userId);

    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
}


export async function getProjectByIdController(req, res, next) {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const project = await getProjectById({
      projectId,
      userId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
}





export async function updateProjectController(req, res) {
  try {
    const { projectId } = req.params;
    const { name, description, status } = req.body;

    const ownerId = req.user.id;

    const project = await updateProject({
      projectId,
      ownerId,
      name,
      description,
      status,
    });

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    switch (error.message) {
      case "PROJECT_NOT_FOUND":
        return res.status(404).json({ error: "Project not found" });

      case "NO_FIELDS_TO_UPDATE":
        return res.status(400).json({ error: "No valid fields to update" });

      default:
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
  }
}




export async function deleteProjectController(req, res) {
  try {
    const { projectId } = req.params;
    const ownerId = req.user.id;

    await deleteProject({ projectId, ownerId });

    return res.status(204).send();
  } catch (error) {
    switch (error.message) {
      case "PROJECT_NOT_FOUND":
        return res.status(404).json({ error: "Project not found" });

      default:
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
  }
}
