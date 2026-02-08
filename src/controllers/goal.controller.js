import { completeGoal } from "../services/goal.service.js";

export const completeGoalController = async (req, res) => {
  const { goalId } = req.params;
  const userId = req.user.id;

  const goal = await completeGoal(goalId, userId);

  res.json(goal);
};
