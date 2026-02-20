import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Activity as ActivityIcon, Clock, User, CheckCircle2, FileText, GitBranch, Target } from "lucide-react";
import { Sidebar } from "../shared/Sidebar";
import { Navbar } from "../shared/Navbar";
import { activity as activityApi } from "../../api/services";
import { projects as projectApi } from "../../api/projects";
import { Project, Activity } from "../../api/types";

interface ActivityPageProps {
    theme: "light" | "dark";
    toggleTheme: () => void;
}

export function ActivityPage({ theme, toggleTheme }: ActivityPageProps) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await projectApi.getAll();
                setProjects(res.data);
                if (res.data.length > 0) {
                    setSelectedProjectId(res.data[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch projects", error);
            }
        };
        fetchProjects();
    }, []);

    useEffect(() => {
        if (!selectedProjectId) return;

        const fetchActivities = async () => {
            setLoading(true);
            try {
                const res = await activityApi.getAll(selectedProjectId);
                setActivities(res.data);
            } catch (error) {
                console.error("Failed to fetch activities", error);
            } finally {
                setLoading(false);
            }
        };
        fetchActivities();
    }, [selectedProjectId]);

    const getActivityIcon = (type: string) => {
        switch (type.toUpperCase()) {
            case "GOAL": return <Target className="w-5 h-5 text-indigo-600" />;
            case "DOCUMENT": return <FileText className="w-5 h-5 text-blue-600" />;
            case "DECISION": return <GitBranch className="w-5 h-5 text-purple-600" />;
            case "TASK": return <CheckCircle2 className="w-5 h-5 text-green-600" />;
            default: return <ActivityIcon className="w-5 h-5 text-gray-600" />;
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F6F7FB] dark:bg-[#0F172A]">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-64">
                <Navbar theme={theme} toggleTheme={toggleTheme} />
                <main className="flex-1 p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                                    <ActivityIcon className="w-8 h-8 text-indigo-600" />
                                    Activity
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Stay updated with the latest changes
                                </p>
                            </div>

                            <select
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                                className="bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="" disabled>Select Project</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : activities.length === 0 ? (
                            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ActivityIcon className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400">No activity found for this project.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {activities.map((activity, index) => (
                                    <div
                                        key={activity.id}
                                        className="relative flex items-start gap-4 p-6 bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-gray-700"
                                    >
                                        {index !== activities.length - 1 && (
                                            <div className="absolute left-9 top-16 w-0.5 h-12 bg-gray-100 dark:bg-gray-800" />
                                        )}
                                        <div className="p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                            {getActivityIcon(activity.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    {activity.title || activity.description}
                                                </h3>
                                                <span className="text-xs text-gray-400 flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(activity.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                {activity.description}
                                            </p>
                                            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                                                <User className="w-3.5 h-3.5" />
                                                <span>{activity.user?.name || "Someone"} performed this action</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
