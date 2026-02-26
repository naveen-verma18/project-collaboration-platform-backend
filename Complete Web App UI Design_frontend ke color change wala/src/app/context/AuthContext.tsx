import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuthUser {
    id: string;
    email: string;
}

interface AuthContextValue {
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean;
    login: (token: string) => void;
    logout: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Decode a JWT payload without any library.
 * Returns null if the token is malformed, expired, or otherwise invalid.
 */
function decodeToken(token: string): AuthUser | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;

        // Base64url → Base64 → JSON
        const payload = JSON.parse(
            atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
        );

        // Check expiry
        if (payload.exp && Date.now() / 1000 > payload.exp) {
            return null; // Expired
        }

        // The backend encodes user data under `id` and `email` (or `userId`/`sub`)
        const id: string =
            payload.id || payload.userId || payload.sub || "";
        const email: string = payload.email || "";

        if (!id) return null;

        return { id, email };
    } catch {
        return null;
    }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // On mount: validate any token already in localStorage
    useEffect(() => {
        const stored = localStorage.getItem("token");
        if (stored) {
            const decoded = decodeToken(stored);
            if (decoded) {
                setToken(stored);
                setUser(decoded);
            } else {
                // Stale / expired / malformed — clean up
                localStorage.removeItem("token");
            }
        }
        setIsLoading(false);
    }, []);

    /** Call after a successful login/register API response. */
    const login = useCallback((newToken: string) => {
        const decoded = decodeToken(newToken);
        if (!decoded) {
            console.error("AuthContext: received an invalid token from server.");
            return;
        }
        localStorage.setItem("token", newToken);
        setToken(newToken);
        setUser(decoded);
    }, []);

    /** Clear all auth state immediately. */
    const logout = useCallback(() => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used inside <AuthProvider>");
    }
    return ctx;
}
