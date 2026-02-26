import { useNavigate } from "react-router";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const LogoutButton = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.1)] rounded-md transition-colors"
            title="Logout"
        >
            <LogOut size={18} />
            <span>Logout</span>
        </button>
    );
};
