import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import { ArrowDownLeft, ArrowUpRight, Loader2, Wallet } from "lucide-react";
import SettlementSummaryCard from "../components/SettlementSummaryCard";
import SettlementCard from "../components/SettlementCard";
import SettlementHistory from "../components/SettlementHistory";
import SettlementModal from "../components/SettlementModal";
import {
  getPendingSettlements,
  getSettlementSummary,
  getSettlementHistory,
  createSettlement,
} from "../api/settlementApi";

export default function SettlementPage() {
  const [settlements, setSettlements] = useState([]);
  const [summary, setSummary] = useState({
    youOwe: 0,
    youAreOwed: 0,
    netBalance: 0,
  });
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("All Groups");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [settlementAmount, setSettlementAmount] = useState("");
  const [transactionReference, setTransactionReference] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchSettlementData = async () => {
    try {
      setLoading(true);
      setError("");

      const [pendingResponse, summaryResponse, historyResponse] =
        await Promise.all([
          getPendingSettlements(),
          getSettlementSummary(),
          getSettlementHistory(),
        ]);

      setSettlements(pendingResponse.data || []);
      setSummary(
        summaryResponse.data || {
          youOwe: 0,
          youAreOwed: 0,
          netBalance: 0,
        }
      );
      setHistory(historyResponse.data || []);
    } catch (err) {
      console.error("Settlement fetch error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load settlement data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlementData();
  }, []);

  const groups = useMemo(
    () => [...new Set(settlements.map((item) => item.group).filter(Boolean))],
    [settlements]
  );

  const filteredSettlements = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return settlements.filter((settlement) => {
      const person =
        settlement.type === "pay"
          ? settlement.receiver
          : settlement.payer;

      const matchesSearch =
        !query ||
        person?.toLowerCase().includes(query) ||
        settlement.group?.toLowerCase().includes(query);

      const matchesGroup =
        selectedGroup === "All Groups" ||
        settlement.group === selectedGroup;

      return matchesSearch && matchesGroup;
    });
  }, [settlements, searchTerm, selectedGroup]);

  const handleOpenSettlement = (settlement) => {
    if (settlement.type !== "pay") return;

    setSelectedSettlement(settlement);
    setSettlementAmount(String(settlement.amount));
    setPaymentMethod("Cash");
    setTransactionReference("");
  };

  const handleCloseModal = () => {
    if (submitting) return;

    setSelectedSettlement(null);
    setSettlementAmount("");
    setPaymentMethod("Cash");
    setTransactionReference("");
  };

  const handleConfirmSettlement = async () => {
    if (!selectedSettlement || selectedSettlement.type !== "pay") return;

    const amount = Number(settlementAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Please enter a valid settlement amount.");
      return;
    }

    if (amount > Number(selectedSettlement.amount) + 0.01) {
      alert(
        `You can settle a maximum of ₹${Number(
          selectedSettlement.amount
        ).toFixed(2)}.`
      );
      return;
    }

    try {
      setSubmitting(true);

      await createSettlement({
        groupId: selectedSettlement.groupId,
        receiverId: selectedSettlement.receiverId,
        amount,
        paymentMethod,
        transactionReference,
      });

      handleCloseModal();
      await fetchSettlementData();
    } catch (err) {
      console.error("Settlement creation error:", err);
      alert(
        err.response?.data?.message ||
          "Failed to record settlement."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
  className="flex min-h-screen"
  style={{
    background:
      "radial-gradient(circle at 82% 8%, rgba(16,185,129,0.18), transparent 35%), linear-gradient(120deg, #0F172A 0%, #172033 38%, #1E293B 68%, #0F2B46 100%)"
  }}
>
        <Sidebar />
        <div className="flex-1 flex items-center justify-center text-slate-500">
          <div className="flex items-center gap-2">
            <Loader2 size={20} className="animate-spin" />
            Loading settlements...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
  className="flex min-h-screen"
  style={{
    background:
      "radial-gradient(circle at 82% 8%, rgba(16,185,129,0.18), transparent 35%), linear-gradient(120deg, #0F172A 0%, #172033 38%, #1E293B 68%, #0F2B46 100%)"
  }}
>
      <Sidebar />

      <main className="flex-1 p-6 lg:p-8">
        <div className="rounded-2xl shadow-sm mb-6 px-7 py-6 text-white bg-gradient-to-r from-emerald-700 to-slate-800">
          <h1 className="text-3xl font-bold">Settlements</h1>
          <p className="mt-1.5 text-sm text-white/80">
            Manage pending balances and completed payments
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-5 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <SettlementSummaryCard
            title="You Owe"
            amount={summary.youOwe}
            color="text-red-600"
            icon={<ArrowUpRight size={20} className="text-red-500" />}
          />
          <SettlementSummaryCard
            title="You Are Owed"
            amount={summary.youAreOwed}
            color="text-emerald-600"
            icon={<ArrowDownLeft size={20} className="text-emerald-600" />}
          />
          <SettlementSummaryCard
            title="Net Balance"
            amount={Math.abs(summary.netBalance || 0)}
            color={
              summary.netBalance >= 0
                ? "text-emerald-600"
                : "text-red-600"
            }
            icon={
              <Wallet
                size={20}
                className={
                  summary.netBalance >= 0
                    ? "text-emerald-600"
                    : "text-red-500"
                }
              />
            }
          />
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm mb-7">
          <div className="flex gap-3 flex-col sm:flex-row">
            <input
              type="text"
              placeholder="Search people or groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-0 border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />

            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="border border-slate-300 rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:border-emerald-500"
            >
              <option>All Groups</option>
              {groups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>
        </div>

        <section className="mb-7">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Pending Settlements
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Payments that still need to be recorded
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {filteredSettlements.length > 0 ? (
              filteredSettlements.map((settlement, index) => (
                <SettlementCard
                  key={`${settlement.groupId}-${settlement.payerId}-${settlement.receiverId}-${index}`}
                  settlement={settlement}
                  onSettle={handleOpenSettlement}
                />
              ))
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center text-slate-500">
                No pending settlements found.
              </div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Settlement History
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Payments recorded through SplitSense
              </p>
            </div>
          </div>

          {history.length > 0 ? (
            <div>
              {history.map((item) => (
                <SettlementHistory key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-6">
              No completed settlements yet.
            </p>
          )}
        </section>
      </main>

      <SettlementModal
        settlement={selectedSettlement}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        amount={settlementAmount}
        setAmount={setSettlementAmount}
        transactionReference={transactionReference}
        setTransactionReference={setTransactionReference}
        onClose={handleCloseModal}
        onConfirm={handleConfirmSettlement}
        loading={submitting}
      />
    </div>
  );
}
