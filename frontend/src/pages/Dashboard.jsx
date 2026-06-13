import Sidebar from "../components/Sidebar";
import SummaryCard from "../components/SummaryCard";
import GroupCard from "../components/GroupCard";
import ExpenseItem from "../components/ExpenseItem";

function Dashboard() {
return ( <div className="flex bg-slate-100 min-h-screen">

```
  <Sidebar />

  <div className="flex-1 p-8 overflow-y-auto">

    {/* Header */}

    <div className="flex justify-between items-center mb-8">

      <div>
        <h1 className="text-3xl font-bold text-emerald-800">
          Welcome Back, User
        </h1>

        <p className="text-gray-500">
          Here's your expense overview
        </p>
      </div>

      <img
        src="https://i.pravatar.cc/40"
        alt="profile"
        className="rounded-full"
      />

    </div>

    {/* Quick Actions */}

    <div className="flex gap-4 mt-6">

      <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition">
        + Add Expense
      </button>

      <button className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
        + Create Group
      </button>

    </div>

    {/* Summary Cards */}

    <div className="grid grid-cols-3 gap-6 mt-8">

      <SummaryCard
        title="You Owe"
        value="₹500"
        color="text-red-500"
      />

      <SummaryCard
        title="You Are Owed"
        value="₹1200"
        color="text-green-500"
      />

      <SummaryCard
        title="Groups"
        value="3"
        color="text-blue-500"
      />

    </div>

    {/* Recent Expenses */}

    <section id="expenses" className="mt-16">

      <h2 className="text-2xl font-bold mb-6">
        Recent Expenses
      </h2>

      <div className="bg-white p-6 rounded-xl shadow">

        <ExpenseItem
          title="Dinner"
          amount="800"
        />

        <ExpenseItem
          title="Uber"
          amount="300"
        />

        <ExpenseItem
          title="Movie Tickets"
          amount="450"
        />

      </div>

    </section>

    {/* Groups */}

    <section id="groups" className="mt-20">

      <h2 className="text-2xl font-bold mb-6">
        Active Groups
      </h2>

      <div className="grid grid-cols-3 gap-6">

        <GroupCard
          name="Goa Trip"
          members={7}
          totalExpense={15000}
        />

        <GroupCard
          name="Flat Expenses"
          members={4}
          totalExpense={8000}
        />

        <GroupCard
          name="College Friends"
          members={10}
          totalExpense={1200}
        />

      </div>

    </section>

    {/* AI Insights */}

    <section id="insights" className="mt-20">

      <h2 className="text-2xl font-bold mb-6">
        AI Insights
      </h2>

      <div className="bg-white p-8 rounded-xl shadow">

        <p className="text-lg">
          💡 You spent 42% of your money on food this month.
        </p>

        <p className="text-lg mt-4">
          💡 Friday is your highest spending day.
        </p>

        <p className="text-lg mt-4">
          💡 Transportation expenses increased by 12%.
        </p>

      </div>

    </section>

    {/* Monthly Statistics */}

    <section id="stats" className="mt-20 mb-20">

      <h2 className="text-2xl font-bold mb-6">
        Monthly Statistics
      </h2>

      <div className="bg-white h-96 rounded-xl shadow flex items-center justify-center text-gray-500">

        Charts Coming Soon

      </div>

    </section>

  </div>

</div>


);
}

export default Dashboard;
