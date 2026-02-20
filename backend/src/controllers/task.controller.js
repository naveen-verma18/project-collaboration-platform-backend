import * as taskService from "../services/task.service.js";

export const createTask = async (req, res) => {
    const { projectId } = req.params;
    const { title, description, assignedTo } = req.body;
    const userId = req.user.id;

    try {
        const task = await taskService.createTask({
            projectId,
            title,
            description,
            assignedTo,
            userId
        });
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getTasks = async (req, res) => {
    const { projectId } = req.params;
    try {
        const tasks = await taskService.getTasks(projectId);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateTask = async (req, res) => {
    const { taskId } = req.params;
    const updates = req.body;
    const userId = req.user.id;

    try {
        const task = await taskService.updateTask(taskId, updates, userId);
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteTask = async (req, res) => {
    const { taskId } = req.params;
    const userId = req.user.id;

    try {
        await taskService.deleteTask(taskId, userId);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
