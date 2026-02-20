import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { motion } from "motion/react";
import {
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Flag,
  TrendingUp,
} from "lucide-react";
import { goals as goalApi } from "../../api/services";

interface Goal {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: string;
  assignee: string;
  createdAt: string;
  // Backend doesn't have priority/dueDate/assignee/progress yet in schema?
  // Schema: id, title, description, isCompleted, completedAt, projectId, createdById, createdAt, updatedAt
  // Logic: progress is calculated based on sub-tasks? Backend schema doesn't have sub-tasks for goals.
  // I will use mock data for missing fields for now or just stick to schema.
  // Schema has: title, description, isCompleted.
}

export function GoalsTab() {
  const { projectId } = useParams();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchGoals();
    }
  }, [projectId]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const data = await goalApi.getAll(projectId!);
      // Map backend data to frontend interface
      // Missing fields will be mocked for UI completeness until schema is updated
      const mappedGoals = data.map((g: any) => ({
        ...g,
        progress: g.isCompleted ? 100 : 0, // Simple progress
        priority: "MEDIUM", // Mock
        dueDate: "No due date", // Mock
        assignee: "Unassigned", // Mock
      }));
      setGoals(mappedGoals);
    } catch (error) {
      console.error("Failed to fetch goals", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleGoal = async (id: string, currentStatus: boolean) => {
    if (currentStatus) return; // Already completed
    try {
      // Optimistic update
      setGoals(goals.map(g => g.id === id ? { ...g, isCompleted: true, progress: 100 } : g));
      await goalApi.complete(id);
    } catch (error) {
      console.error("Failed to complete goal", error);
      fetchGoals(); // Revert
    }
  };

  const handleCreateGoal = async (title: string, description: string) => {
    try {
      await goalApi.create(projectId!, { title, description });
      setShowAddModal(false);
      fetchGoals();
    } catch (error) {
      console.error("Failed to create goal", error);
    }
  };

  const priorityConfig = {
    LOW: { color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400", label: "Low" },
    MEDIUM: { color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Medium" },
    HIGH: { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", label: "High" },
  };

  const completedCount = goals.filter((g) => g.isCompleted).length;
  // Avoid division by zero
  const totalProgress = goals.length === 0 ? 0 : Math.round(
    (goals.reduce((acc, g) => acc + (g.isCompleted ? 100 : 0), 0) / goals.length)
  );

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Goals
            </h3>
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {goals.length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Completed
            </h3>
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {completedCount}/{goals.length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Overall Progress
            </h3>
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {totalProgress}%
          </p>
        </motion.div>
      </div>

      {/* Add Goal Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          All Goals
        </h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Goal
        </motion.button>
      </div>

      {/* Goals List */}
      {loading ? (
        <div className="text-center py-10">Loading goals...</div>
      ) : goals.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No goals found. Create one to get started!</div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 ${goal.isCompleted ? "opacity-70" : ""
                }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleGoal(goal.id, goal.isCompleted)}
                  className="mt-1 flex-shrink-0"
                >
                  {goal.isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400 hover:text-indigo-600 dark:hover:text-purple-400 transition-colors" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <h3
                        className={`text-lg font-semibold mb-1 ${goal.isCompleted
                            ? "line-through text-gray-500 dark:text-gray-600"
                            : "text-gray-900 dark:text-white"
                          }`}
                      >
                        {goal.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {goal.description}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${priorityConfig[goal.priority].color
                        }`}
                    >
                      <Flag className="w-3 h-3 inline-block mr-1" />
                      {priorityConfig[goal.priority].label}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {goal.isCompleted ? 100 : 0}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${goal.isCompleted ? 100 : 0}%` }}
                        transition={{ duration: 1, delay: index * 0.05 }}
                        className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Due: {goal.dueDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs">
                        {goal.assignee.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span>{goal.assignee}</span>
                    </div>
                    {/* Real-time indicator */}
                    <div className="ml-auto flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-green-600 dark:text-green-400">
                        Live
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showAddModal && <CreateGoalModal onClose={() => setShowAddModal(false)} onCreate={handleCreateGoal} />}
    </div>
  );
}

function CreateGoalModal({ onClose, onCreate }: { onClose: () => void; onCreate: (t: string, d: string) => void }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title) return;
    setLoading(true);
    await onCreate(title, desc);
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Add New Goal</h2>
        <input className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Goal Title" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:text-white" placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">{loading ? "Saving..." : "Create"}</button>
        </div>
      </div>
    </div>
  )
}
