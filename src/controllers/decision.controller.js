import * as decisionService from "../services/decision.service.js";
import { createDecision } from "../services/decision.service.js";

export const createDecisionController = async (req, res) => {
  const { projectId } = req.params;
  const { title, reason } = req.body;
  const userId = req.user.id;

  const decision = await createDecision(
    projectId,
    title,
    reason,
    userId
  );

  res.status(201).json(decision);
};

export const createDecision = async (req, res) => {
  const { projectId } = req.params;
  const { title, reason } = req.body;

  const decision = await decisionService.createDecision({
    projectId,
    userId: req.user.id,
    title,
    reason
  });

  res.status(201).json(decision);
};

export const getDecisions = async (req, res) => {
  const { projectId } = req.params;

  const decisions = await decisionService.getProjectDecisions({
    projectId,
    userId: req.user.id
  });

  res.json(decisions);
};
