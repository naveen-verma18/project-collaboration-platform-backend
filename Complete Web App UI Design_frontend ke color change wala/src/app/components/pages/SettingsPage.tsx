import { motion } from "motion/react";
import { Settings } from "lucide-react";
import { Sidebar } from "../shared/Sidebar";
import { Navbar } from "../shared/Navbar";

interface SettingsPageProps {
    theme: "light" | "dark";
    toggleTheme: () => void;
}

export function SettingsPage({ theme, toggleTheme }: SettingsPageProps) {
    return (
        <div className="flex min-h-screen bg-[#F6F7FB] dark:bg-[#0F172A]">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-64">
                <Navbar theme={theme} toggleTheme={toggleTheme} />
                <main className="flex-1 p-8">
                    <div className="mb-8 text-center">
                        <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Settings className="w-12 h-12 text-indigo-600 dark:text-purple-400" />
                        </div>
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                        >
                            Settings
                        </motion.h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage your account and application settings.
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
}
