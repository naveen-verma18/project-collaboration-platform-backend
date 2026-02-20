import { motion } from "motion/react";
import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  FolderKanban,
  Target,
  FileText,
  GitBranch,
  Activity,
  Users,
  Settings,
  Sparkles,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Decisions", href: "/decisions", icon: GitBranch },
  { name: "Activity", href: "/activity", icon: Activity },
  { name: "Team", href: "/team", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <motion.aside
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-[#1E293B] border-r border-gray-200 dark:border-gray-700 flex flex-col z-30"
    >
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Collab
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Platform
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.name} to={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group ${isActive
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${isActive
                        ? "text-white"
                        : "text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-purple-400"
                      }`}
                  />
                  <span>{item.name}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Upgrade Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
          <div className="relative z-10">
            <Sparkles className="w-8 h-8 mb-2" />
            <h3 className="font-semibold mb-1">Upgrade to Pro</h3>
            <p className="text-xs text-white/80 mb-3">
              Get unlimited projects and advanced features
            </p>
            <button className="w-full bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-white/90 transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
