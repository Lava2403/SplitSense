import {
  LayoutDashboard,
  Users,
  Receipt,
  HandCoins,
  Brain,
  User,
  LogOut,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { clearAuth, getStoredUser } from "../utils/auth";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getStoredUser();

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Groups", icon: Users, path: "/groups" },
    { label: "Expenses", icon: Receipt, path: "/expenses" },
    { label: "Settlements", icon: HandCoins, path: null },
    { label: "Insights", icon: Brain, path: null },
    { label: "Profile", icon: User, path: null },
  ];

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-6 flex flex-col shrink-0">
      <h1
        className="text-3xl font-extrabold mb-2 tracking-wide text-emerald-400 cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        SplitSense
      </h1>

      <p className="text-sm text-slate-400 mb-8 truncate">
        {user?.name || "Guest"}
      </p>

      <nav className="flex flex-col gap-2">
        {navItems.map(({ label, icon: Icon, path }) => {
          const isActive = path && location.pathname === path;

          return (
            <button
              key={label}
              onClick={() => path && navigate(path)}
              disabled={!path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition ${
                isActive
                  ? "bg-emerald-500/20 text-emerald-300"
                  : path
                    ? "hover:bg-slate-800 hover:text-emerald-300"
                    : "opacity-50 cursor-not-allowed"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="mt-auto flex items-center justify-center gap-2 bg-red-500/90 hover:bg-red-500 px-4 py-2.5 rounded-lg transition"
      >
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;
