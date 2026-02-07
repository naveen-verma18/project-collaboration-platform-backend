import * as progressService from "../services/projectProgress.service.js";

export const getProjectProgress = async (req, res) => {
  const { projectId } = req.params;

  const progress = await progressService.getProjectProgress({
    projectId,
    userId: req.user.id
  });

  res.json(progress);
};
