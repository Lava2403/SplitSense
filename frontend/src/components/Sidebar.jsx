import {
  LayoutDashboard,
  Users,
  Receipt,
  HandCoins,
  Brain,
  User,
  LogOut
} from "lucide-react";

import { useNavigate } from "react-router-dom";

function Sidebar() {

  const navigate = useNavigate();

  return (
    <div className="w-64 h-screen bg-slate-900 text-white p-6 flex flex-col">

      <h1
        className="text-3xl font-extrabold mb-10 tracking-wide text-emerald-500 cursor-pointer"
        style={{ fontFamily: "Space Grotesk" }}
        onClick={() => navigate("/dashboard")}
      >
        SplitSense
      </h1>

      <nav className="flex flex-col gap-5">

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 hover:text-emerald-400"
        >
          <LayoutDashboard size={20} />
          Dashboard
        </button>

        <button
          onClick={() => navigate("/groups")}
          className="flex items-center gap-3 hover:text-emerald-400"
        >
          <Users size={20} />
          Groups
        </button>

        <button
          onClick={() => navigate("/expenses")}
          className="flex items-center gap-3 hover:text-emerald-400"
        >
          <Receipt size={20} />
          Expenses
        </button>

        <button
          className="flex items-center gap-3 hover:text-emerald-400"
        >
          <HandCoins size={20} />
          Settlements
        </button>

        <button
          className="flex items-center gap-3 hover:text-emerald-400"
        >
          <Brain size={20} />
          Insights
        </button>

        <button
          className="flex items-center gap-3 hover:text-emerald-400"
        >
          <User size={20} />
          Profile
        </button>

      </nav>

      <button className="mt-auto flex items-center gap-2 bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600">

        <LogOut size={18} />

        Logout

      </button>

    </div>
  );
}

export default Sidebar;