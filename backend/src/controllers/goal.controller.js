import * as goalService from "../services/goal.service.js";

export const createGoal = async (req, res) => {
  const { projectId } = req.params;
  const { title, description } = req.body;
  const userId = req.user.id;

  try {
    const goal = await goalService.createGoal({
      projectId,
      title,
      description,
      userId
    });
    res.status(201).json({
      success: true,
      data: goal,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getGoals = async (req, res) => {
  const { projectId } = req.params;
  try {
    const goals = await goalService.getGoals(projectId);
    res.json({
      success: true,
      data: goals,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const completeGoalController = async (req, res) => {
  const { goalId } = req.params;
  const userId = req.user.id;

  try {
    const goal = await goalService.completeGoal(goalId, userId);
    res.json({
      success: true,
      data: goal,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
