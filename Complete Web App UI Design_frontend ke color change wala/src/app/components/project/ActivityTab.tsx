import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Activity as ActivityIcon,
  FileText,
  Target,
  GitBranch,
  UserPlus,
  UserMinus,
  Edit,
  CheckCircle,
  Clock,
  Loader2
} from "lucide-react";
import { useParams } from "react-router";
import { activity as activityApi } from "../../api/services";

interface ActivityItem {
  id: string;
  type: "goal" | "document" | "decision" | "member" | "edit" | "complete" | "create"; // Added 'create'
  user: {
    name: string;
    avatar: string;
    color: string;
  };
  action: string;
  target: string;
  timestamp: string;
  isLive: boolean; // Not supported by backend yet, always false
}

const activityIcons: any = {
  goal: Target,
  document: FileText,
  decision: GitBranch,
  member: UserPlus,
  edit: Edit,
  complete: CheckCircle,
  create: ActivityIcon
};

export function ActivityTab() {
  const { projectId } = useParams();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchActivities = async () => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      const response = await activityApi.getAll(projectId);
      const data = response.data;

      // Backend returns: [{ id, action, metadata, createdAt, user }]
      // We need to parse 'action' to determine type and target.
      // Or we rely on metadata?
      // Current backend 'createActivity' stores 'action' as string.
      // We probably need to improve backend storer to be more structured, or parse string.
      // For now, let's just display the action string as description.

      const formattedActivities = data.map((a: any) => {
        // Simple heuristic to determine type from action string
        let type = "edit";
        if (a.action.includes("created")) type = "create";
        if (a.action.includes("completed")) type = "complete";
        if (a.action.includes("goal")) type = "goal";
        if (a.action.includes("document")) type = "document";
        if (a.action.includes("decision")) type = "decision";
        if (a.action.includes("member")) type = "member";

        return {
          id: a.id,
          type: type as any,
          user: {
            name: a.user?.name || "Unknown",
            avatar: a.user?.name ? a.user.name.substring(0, 2).toUpperCase() : "??",
            color: "from-blue-500 to-cyan-500"
          },
          action: "performed action", // We can refine this
          target: a.action, // The backend 'action' field describes what happened e.g. "created task X"
          timestamp: new Date(a.createdAt).toLocaleString(),
          isLive: false
        }
      });
      setActivities(formattedActivities);

    } catch (err) {
      console.error("Failed to load activity", err);
      setError("Failed to load activity feed");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchActivities();
  }, [projectId]);


  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Activity Feed
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time updates from your team
        </p>
      </div>

      {/* Error */}
      {error && <div className="text-red-500 bg-red-50 p-3 rounded-lg">{error}</div>}


      {/* Stats - MOCKED FOR NOW AS BACKEND DOESN'T AGGREGATE */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Today
            </h3>
            <ActivityIcon className="w-5 h-5 text-indigo-600 dark:text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{activities.length}</p>
        </motion.div>
        {/* ... other stats omitted or mocked with static numbers for now ... */}
      </div>

      {/* Activity Timeline */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6">
          <div className="space-y-6">
            {activities.length === 0 && <p className="text-center text-gray-500">No activity recorded yet.</p>}
            {activities.map((activity, index) => {
              const Icon = activityIcons[activity.type] || ActivityIcon;
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-4 relative"
                >
                  {/* Timeline Line */}
                  {index < activities.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
                  )}

                  {/* Avatar */}
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${activity.user.color} flex items-center justify-center text-white font-medium flex-shrink-0 relative z-10`}
                  >
                    {activity.user.avatar}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <p className="text-gray-900 dark:text-white">
                        <span className="font-semibold">{activity.user.name}</span>{" "}
                        <span className="text-gray-600 dark:text-gray-400">
                          {/* {activity.action} */}
                        </span>{" "}
                        <span className="font-medium">{activity.target}</span>
                      </p>
                      {activity.isLive && (
                        <span className="flex items-center gap-1.5 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium whitespace-nowrap">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          LIVE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-4 h-4" />
                        <span className="capitalize">{activity.type}</span>
                      </div>
                      <span>•</span>
                      <span>{activity.timestamp}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Load More */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2.5 text-indigo-600 dark:text-purple-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            Load More Activity
          </motion.button>
        </div>
      </div>
    </div>
  );
}
