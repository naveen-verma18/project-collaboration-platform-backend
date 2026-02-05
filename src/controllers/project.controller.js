import { createProject } from "../services/project.service.js";
import { getMyProjects } from "../services/project.service.js";
import { getProjectById } from "../services/project.service.js";

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

