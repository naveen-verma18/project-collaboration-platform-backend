import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ChevronDown,
  Share2,
  UserPlus,
  Target,
  FileText,
  GitBranch,
  Activity,
  Users as UsersIcon,
} from "lucide-react";
import { Sidebar } from "../shared/Sidebar";
import { Navbar } from "../shared/Navbar";
import { GoalsTab } from "./GoalsTab";
import { DocumentsTab } from "./DocumentsTab";
import { DecisionsTab } from "./DecisionsTab";
import { ActivityTab } from "./ActivityTab";
import { MembersTab } from "./MembersTab";
import { AIAssistant } from "../ai/AIAssistant";
import { OnlinePresence } from "./OnlinePresence";
import { projects as projectApi } from "../../api/projects";
import type { Project } from "../dashboard/Dashboard";
import { useAuth } from "../../context/AuthContext";

interface ProjectWorkspaceProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

type TabType = "goals" | "documents" | "decisions" | "activity" | "members";

const tabs = [
  { id: "goals" as TabType, label: "Goals", icon: Target },
  { id: "documents" as TabType, label: "Documents", icon: FileText },
  { id: "decisions" as TabType, label: "Decisions", icon: GitBranch },
  { id: "activity" as TabType, label: "Activity", icon: Activity },
  { id: "members" as TabType, label: "Members", icon: UsersIcon },
];

export function ProjectWorkspace({ theme, toggleTheme }: ProjectWorkspaceProps) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("goals");
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Status options match backend/frontend types
  const statusOptions = [
    { value: "PLANNING", label: "Planning", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
    { value: "ACTIVE", label: "Active", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    { value: "COMPLETED", label: "Completed", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  ];

  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId]);

  const loadProject = async (id: string) => {
    try {
      setLoading(true);
      const response = await projectApi.getOne(id);
      setProject(response.data);
    } catch (error) {
      console.error("Failed to load project", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectId || !project) return;
    if (!confirm(`Are you sure you want to delete project "${project.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await projectApi.delete(projectId);
      navigate("/projects");
    } catch (error: any) {
      console.error("Failed to delete project", error);
      alert(error?.message || "Failed to delete project");
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!project || !projectId) return;
    try {
      // Optimistic update
      setProject({ ...project, status: newStatus as any });
      await projectApi.update(projectId, { status: newStatus });
    } catch (error) {
      console.error("Failed to update status", error);
      loadProject(projectId); // Revert on error
    }
  };


  const currentStatus = statusOptions.find((s) => s.value === project?.status);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F6F7FB] dark:bg-[#0F172A] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen bg-[#F6F7FB] dark:bg-[#0F172A] items-center justify-center">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  const isOwner = user && project && (project as any).ownerId === user.id;

  return (
    <div className="flex min-h-screen bg-[#F6F7FB] dark:bg-[#0F172A]">
      <Sidebar />

      <div className="flex-1 flex flex-col ml-64">
        <Navbar theme={theme} toggleTheme={toggleTheme} />

        <main className="flex-1">
          {/* Project Header */}
          <div className="bg-white dark:bg-[#1E293B] border-b border-gray-200 dark:border-gray-700 px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {project.name}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {project.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <OnlinePresence />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:border-indigo-500 dark:hover:border-purple-500 transition-all duration-200 flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Invite
                </motion.button>

                {isOwner && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDeleteProject}
                    className="px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all duration-200"
                  >
                    Delete Project
                  </motion.button>
                )}

                <div className="relative">
                  <select
                    value={project.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className={`appearance-none pl-4 pr-10 py-2.5 rounded-xl font-medium cursor-pointer border-0 ${currentStatus?.color}`}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative px-6 py-3 font-medium transition-colors"
                >
                  <span
                    className={`flex items-center gap-2 ${activeTab === tab.id
                        ? "text-indigo-600 dark:text-purple-400"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                      }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "goals" && <GoalsTab />}
              {activeTab === "documents" && <DocumentsTab />}
              {activeTab === "decisions" && <DecisionsTab />}
              {activeTab === "activity" && <ActivityTab />}
              {activeTab === "members" && <MembersTab />}
            </motion.div>
          </div>
        </main>
      </div>

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
}
