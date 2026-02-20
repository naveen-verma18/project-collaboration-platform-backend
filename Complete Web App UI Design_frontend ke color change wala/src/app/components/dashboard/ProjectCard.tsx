import { motion } from "motion/react";
import { Users, Clock, TrendingUp } from "lucide-react";
import type { Project } from "./Dashboard";

interface ProjectCardProps {
  project: Project;
  index: number;
  onClick: () => void;
}

export function ProjectCard({ project, index, onClick }: ProjectCardProps) {
  const statusConfig = {
    PLANNING: {
      label: "Planning",
      color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    ACTIVE: {
      label: "Active",
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
    COMPLETED: {
      label: "Completed",
      color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -4 }}
      onClick={onClick}
      className="bg-white dark:bg-[#1E293B] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 cursor-pointer group"
    >
      {/* Gradient Header */}
      <div className={`h-32 bg-gradient-to-br ${project.color} p-6 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[project.status].color}`}
            >
              {statusConfig[project.status].label}
            </span>
            <TrendingUp className="w-5 h-5 text-white/80" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
          {project.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {project.progress}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${project.progress}%` }}
              transition={{ duration: 1, delay: index * 0.05 }}
              className={`h-full bg-gradient-to-r ${project.color} rounded-full`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4" />
            <span>{project.members} members</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{project.updatedAt}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
