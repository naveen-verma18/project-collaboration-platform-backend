import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
    Plus,
    Search,
    LayoutGrid,
    CheckCircle2,
    Clock,
    FolderKanban,
} from "lucide-react";
import { Sidebar } from "../shared/Sidebar";
import { Navbar } from "../shared/Navbar";
import { ProjectCard } from "../dashboard/ProjectCard";
import { projects as projectApi } from "../../api/projects";
import type { Project } from "../dashboard/Dashboard";

interface ProjectsPageProps {
    theme: "light" | "dark";
    toggleTheme: () => void;
}

const COLORS = [
    "from-indigo-500 to-purple-500",
    "from-cyan-500 to-blue-500",
    "from-purple-500 to-pink-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-red-500",
    "from-teal-500 to-cyan-500",
];

const getColor = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return COLORS[Math.abs(hash) % COLORS.length];
};

export function ProjectsPage({ theme, toggleTheme }: ProjectsPageProps) {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const data = await projectApi.getAll();
            const mappedProjects = data.data.map((p: any) => ({
                ...p,
                color: getColor(p.id),
                updatedAt: new Date(p.updatedAt).toLocaleDateString(),
            }));
            setProjects(mappedProjects);
        } catch (error) {
            console.error("Failed to fetch projects", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const filteredProjects = projects.filter((project) => {
        const matchesSearch =
            project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
        const matchesFilter =
            filter === "all" ||
            (filter === "active" && project.status !== "COMPLETED") ||
            (filter === "completed" && project.status === "COMPLETED");
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="flex min-h-screen bg-[#F6F7FB] dark:bg-[#0F172A]">
            <Sidebar />

            <div className="flex-1 flex flex-col ml-64">
                <Navbar theme={theme} toggleTheme={toggleTheme} />

                <main className="flex-1 p-8">
                    <div className="mb-8">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                        >
                            Projects
                        </motion.h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            View and manage all your projects
                        </p>
                    </div>

                    <div className="mb-6 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search projects..."
                                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter("all")}
                                className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${filter === "all"
                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                    : "bg-white dark:bg-[#1E293B] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-purple-500"
                                    }`}
                            >
                                <LayoutGrid className="w-4 h-4 inline-block mr-2" />
                                All
                            </button>
                            <button
                                onClick={() => setFilter("active")}
                                className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${filter === "active"
                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                    : "bg-white dark:bg-[#1E293B] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-purple-500"
                                    }`}
                            >
                                <Clock className="w-4 h-4 inline-block mr-2" />
                                Active
                            </button>
                            <button
                                onClick={() => setFilter("completed")}
                                className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${filter === "completed"
                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                    : "bg-white dark:bg-[#1E293B] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-purple-500"
                                    }`}
                            >
                                <CheckCircle2 className="w-4 h-4 inline-block mr-2" />
                                Completed
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-16">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16"
                        >
                            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FolderKanban className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                No projects found
                            </h3>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProjects.map((project, index) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    index={index}
                                    onClick={() => navigate(`/project/${project.id}`)}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
