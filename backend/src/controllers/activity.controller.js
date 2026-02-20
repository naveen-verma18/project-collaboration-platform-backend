import { getProjectActivities } from "../services/activity.service.js";

export const getProjectActivitiesController = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const activities = await getProjectActivities({ projectId });
        res.json({
            success: true,
            data: activities,
        });
    } catch (error) {
        next(error);
    }
};
