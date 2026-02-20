import { motion } from "motion/react";

const onlineUsers = [
  { id: 1, name: "John Doe", avatar: "JD", status: "online" },
  { id: 2, name: "Sarah Smith", avatar: "SS", status: "online" },
  { id: 3, name: "Mike Johnson", avatar: "MJ", status: "online" },
  { id: 4, name: "Emily Brown", avatar: "EB", status: "away" },
];

const colors = [
  "from-indigo-500 to-purple-500",
  "from-cyan-500 to-blue-500",
  "from-purple-500 to-pink-500",
  "from-orange-500 to-red-500",
];

export function OnlinePresence() {
  return (
    <div className="flex items-center -space-x-2">
      {onlineUsers.map((user, index) => (
        <motion.div
          key={user.id}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="relative"
        >
          <div
            className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors[index % colors.length]} flex items-center justify-center text-white text-sm font-medium border-2 border-white dark:border-[#1E293B] cursor-pointer hover:z-10 hover:scale-110 transition-transform`}
            title={user.name}
          >
            {user.avatar}
          </div>
          {user.status === "online" && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#1E293B] animate-pulse" />
          )}
        </motion.div>
      ))}
      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400 border-2 border-white dark:border-[#1E293B] cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
        +5
      </div>
    </div>
  );
}
