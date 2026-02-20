import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Plus, GitBranch, User, Calendar, MessageSquare, Loader2 } from "lucide-react";
import { useParams } from "react-router";
import { decisions as decisionApi } from "../../api/services";

interface Decision {
  id: string;
  title: string;
  description: string;
  madeBy: {
    name: string;
    avatar: string;
    color: string;
  };
  timestamp: string;
  impact: "LOW" | "MEDIUM" | "HIGH";
  category: string;
  createdAt: string;
  user?: {
    name?: string;
    email?: string;
  }
}

export function DecisionsTab() {
  const { projectId } = useParams();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDecisions = async () => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      const data = await decisionApi.getAll(projectId);
      // Transform data if needed, backend returns array of Decision
      // We might need to map backend fields to frontend interface if they differ significantly
      // Assuming backend returns: { id, title, description, impact, status, createdAt, user: { name } }
      const formattedDecisions = data.map((d: any) => ({
        id: d.id,
        title: d.title,
        description: d.description,
        madeBy: {
          name: d.user?.name || "Unknown",
          avatar: d.user?.name ? d.user.name.substring(0, 2).toUpperCase() : "??",
          color: "from-indigo-500 to-purple-500", // Randomize or hash based on name
        },
        timestamp: new Date(d.createdAt).toLocaleDateString(),
        impact: d.impact || "MEDIUM",
        category: "Technical", // Default for now as backend might not have it
        createdAt: d.createdAt
      }));
      setDecisions(formattedDecisions);
    } catch (err: any) {
      console.error("Failed to fetch decisions", err);
      setError("Failed to load decisions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDecisions();
  }, [projectId]);

  const handleDecisionAdded = () => {
    fetchDecisions();
    setShowAddModal(false);
  }

  const impactConfig = {
    LOW: {
      color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
      label: "Low Impact",
    },
    MEDIUM: {
      color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      label: "Medium Impact",
    },
    HIGH: {
      color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      label: "High Impact",
    },
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Project Decisions
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track important decisions and their impact on the project
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Decision
        </motion.button>
      </div>

      {/* Error */}
      {error && <div className="text-red-500 bg-red-50 p-3 rounded-lg">{error}</div>}


      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Decisions
            </h3>
            <GitBranch className="w-5 h-5 text-indigo-600 dark:text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {decisions.length}
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
              High Impact
            </h3>
            <div className="w-5 h-5 rounded-full bg-red-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {decisions.filter((d) => d.impact === "HIGH").length}
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
              This Week
            </h3>
            <Calendar className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {
              decisions.filter(d => {
                const date = new Date(d.createdAt);
                const now = new Date();
                const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
                return date > oneWeekAgo;
              }).length
            }
          </p>
        </motion.div>
      </div>

      {/* Decisions List */}
      <div className="space-y-4">
        {decisions.length === 0 && (
          <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No decisions recorded yet.</p>
          </div>
        )}
        {decisions.map((decision, index) => (
          <motion.div
            key={decision.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${decision.madeBy.color} flex items-center justify-center text-white font-medium flex-shrink-0`}
              >
                {decision.madeBy.avatar}
              </div>

              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {decision.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {decision.description}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${impactConfig[decision.impact].color
                      }`}
                  >
                    {impactConfig[decision.impact].label}
                  </span>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{decision.madeBy.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{decision.timestamp}</span>
                  </div>
                  <div className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">
                    {decision.category}
                  </div>
                  <button className="ml-auto flex items-center gap-2 text-indigo-600 dark:text-purple-400 hover:text-indigo-700 dark:hover:text-purple-300 font-medium">
                    <MessageSquare className="w-4 h-4" />
                    Comment
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Decision Modal */}
      {showAddModal && (
        <AddDecisionModal onClose={() => setShowAddModal(false)} onAdded={handleDecisionAdded} />
      )}
    </div>
  );
}

function AddDecisionModal({ onClose, onAdded }: { onClose: () => void, onAdded: () => void }) {
  const { projectId } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [impact, setImpact] = useState("MEDIUM");
  const [category, setCategory] = useState("Technical");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!projectId) return;
    setIsSubmitting(true);
    try {
      await decisionApi.create(projectId, {
        title,
        reason: description, // Backend Decision model uses 'reason' not 'description'
      });
      onAdded();
    } catch (err) {
      console.error("Failed to add decision", err);
      alert("Failed to add decision");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Log New Decision
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Decision Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter decision title"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the decision and its rationale"
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-400 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Impact Level
              </label>
              <select
                value={impact}
                onChange={(e) => setImpact(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 text-gray-900 dark:text-white"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 text-gray-900 dark:text-white"
              >
                <option>Technical</option>
                <option>Process</option>
                <option>Design</option>
                <option>Business</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Adding..." : "Add Decision"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
