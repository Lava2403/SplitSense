import {
  LayoutDashboard,
  Users,
  Receipt,
  HandCoins,
  Brain,
  User,
  LogOut
} from "lucide-react";

function Sidebar() {
  return (
    <div className="w-64 h-screen bg-slate-900 text-white p-6 flex flex-col">
      <h1 className="text-3xl font-extrabold mb-10 tracking-wide text-emerald-500" 
      style={{ fontFamily: "Space Grotesk" }}
      >
        SplitSense
      </h1>

      <nav className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <LayoutDashboard size={20} />
          Dashboard
        </div>

        <div className="flex items-center gap-3">
          <Users size={20} />
          Groups
        </div>

        <div className="flex items-center gap-3">
          <Receipt size={20} />
          Expenses
        </div>

        <div className="flex items-center gap-3">
          <HandCoins size={20} />
          Settlements
        </div>

        <div className="flex items-center gap-3">
          <Brain size={20} />
          Insights
        </div>

        <div className="flex items-center gap-3">
          <User size={20} />
          Profile
        </div>
      </nav>

      <button className="mt-auto flex items-center gap-2 bg-red-500 px-4 py-2 rounded-lg">
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
}

export default Sidebar;