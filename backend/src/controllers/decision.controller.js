import * as decisionService from "../services/decision.service.js";

export const createDecision = async (req, res) => {
  const { projectId } = req.params;
  const { title, reason } = req.body;
  const userId = req.user.id;

  try {
    const decision = await decisionService.createDecision({
      projectId,
      userId,
      title,
      reason
    });

    res.status(201).json({
      success: true,
      data: decision,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDecisions = async (req, res) => {
  const { projectId } = req.params;
  try {
    const decisions = await decisionService.getDecisions(projectId);
    res.json({
      success: true,
      data: decisions,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
