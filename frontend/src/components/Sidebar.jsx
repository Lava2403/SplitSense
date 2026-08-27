import {
  LayoutDashboard,
  Users,
  Receipt,
  HandCoins,
  Wallet,
  LogOut,
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";
import { clearAuth } from "../utils/auth";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Groups",
      path: "/groups",
      icon: Users,
    },
    {
      label: "Expenses",
      path: "/expenses",
      icon: Receipt,
    },
    {
      label: "Settlements",
      path: "/settlements",
      icon: HandCoins,
    },
    {
      label: "Budget Planner",
      path: "/budget-planner",
      icon: Wallet,
    },
  ];

  const isActivePath = (path) => {
    if (path === "/groups") {
      return (
        location.pathname === "/groups" ||
        location.pathname.startsWith("/group/")
      );
    }

    return location.pathname === path;
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-6 flex flex-col sticky top-0">
      <h1
        className="text-3xl font-extrabold mb-10 tracking-wide text-emerald-500 cursor-pointer"
        style={{ fontFamily: "Space Grotesk" }}
        onClick={() => navigate("/dashboard")}
      >
        SplitSense
      </h1>

      <nav className="flex flex-col gap-2">
        {navItems.map(({ label, path, icon: Icon }) => {
          const isActive = isActivePath(path);

          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                isActive
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-gray-300 hover:bg-slate-800 hover:text-emerald-400"
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 bg-red-500 px-4 py-2.5 rounded-lg hover:bg-red-600 transition-all duration-200"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;