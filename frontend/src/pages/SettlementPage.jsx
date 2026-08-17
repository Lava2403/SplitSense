import { useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
} from "lucide-react";
import SettlementSummaryCard from "../components/SettlementSummaryCard";
import SettlementCard from "../components/SettlementCard";
import SettlementHistory from "../components/SettlementHistory";

const settlements = [
  {
    id: 1,
    person: "Rahul",
    amount: 500,
    type: "pay",
    group: "Goa Trip",
  },
  {
    id: 2,
    person: "Priya",
    amount: 300,
    type: "receive",
    group: "Flat Expenses",
  },
  {
    id: 3,
    person: "Aman",
    amount: 700,
    type: "pay",
    group: "Office Friends",
  },
];

const history = [
  {
    id: 1,
    text: "You settled ₹800 with Rahul",
  },
  {
    id: 2,
    text: "Priya paid you ₹400",
  },
  {
    id: 3,
    text: "Goa Trip settled successfully",
  },
];

export default function SettlementPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSettlements = settlements.filter(
    (settlement) =>
      settlement.person
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      settlement.group
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex bg-slate-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8">
        {/* Hero Banner */}
        <div className="rounded-2xl shadow mb-8 p-8 text-white bg-gradient-to-r from-emerald-700 to-slate-800">
          <h1 className="text-4xl font-bold">Settlements</h1>

          <p className="mt-2 text-white/80">
            Manage pending balances and completed settlements
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SettlementSummaryCard
            title="You Owe"
            amount={1200}
            color="text-red-600"
            icon={<ArrowUpRight className="text-red-500" />}
          />

          <SettlementSummaryCard
            title="You Are Owed"
            amount={850}
            color="text-green-600"
            icon={<ArrowDownLeft className="text-green-600" />}
          />

          <SettlementSummaryCard
            title="Net Balance"
            amount={350}
            color="text-orange-500"
            icon={<Wallet className="text-orange-500" />}
          />
        </div>

        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-xl shadow mb-8">
          <div className="flex gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Search people or groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border rounded-lg px-4 py-2"
            />

            <select className="border rounded-lg px-4 py-2">
              <option>All Groups</option>
              <option>Goa Trip</option>
              <option>Flat Expenses</option>
              <option>Office Friends</option>
            </select>
          </div>
        </div>

        {/* Pending Settlements */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-5">
            Pending Settlements
          </h2>

          <div className="space-y-5">
            {filteredSettlements.length > 0 ? (
              filteredSettlements.map((settlement) => (
                <SettlementCard
                  key={settlement.id}
                  settlement={settlement}
                />
              ))
            ) : (
              <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
                No settlements found.
              </div>
            )}
          </div>
        </div>

        {/* Settlement History */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-5">
            Settlement History
          </h2>

          <div className="space-y-1">
            {history.map((item) => (
              <SettlementHistory
                key={item.id}
                item={item}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}