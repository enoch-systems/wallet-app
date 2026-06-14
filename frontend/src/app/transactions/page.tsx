"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronDown, Download, ArrowUp, ArrowDown, Percent, Smartphone, Monitor, CheckCircle } from "lucide-react";

const API = "https://wallet-app-xqtq.onrender.com";

async function api(method: string, path: string, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(API + path, { method, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

const CATEGORIES = ["All Categories", "Bank Deposit", "Transfer from", "Transfer to", "Airtime", "Betting", "Mobile Data", "Cash Deposit", "OWealth", "Add Money", "OPay Card Payment", "Electricity", "TV", "Reversal", "Cash Withdraw", "Online Payment", "Fixed", "Targets", "Spend & Save", "SafeBox"];
const STATUSES = ["All Status", "Successful", "Pending", "Failed", "To be paid", "Reversed"];

export default function TransactionsPage() {
  const router = useRouter();
  const [txs, setTxs] = useState<Record<string, unknown>[]>([]);
  const [catFilter, setCatFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [showCat, setShowCat] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    try {
      const data = await api("GET", "/wallet/transactions", token);
      setTxs(data);
    } catch { }
  }, [router]);

  useEffect(() => { refresh(); }, [refresh]);

  const totalIn = txs.filter((tx: Record<string, unknown>) => tx.type === "DEPOSIT").reduce((s, tx) => s + Number(tx.amount), 0);
  const totalOut = txs.filter((tx: Record<string, unknown>) => tx.type === "SEND" || tx.type === "WITHDRAW").reduce((s, tx) => s + Number(tx.amount), 0);

  const getIcon = (type: string) => {
    if (type === "DEPOSIT") return { bg: "bg-emerald-50", color: "text-emerald-500", icon: <ArrowDown className="w-5 h-5" /> };
    if (type === "SEND") return { bg: "bg-green-50", color: "text-[#00A651]", icon: <ArrowUp className="w-5 h-5" /> };
    if (type === "WITHDRAW") return { bg: "bg-orange-50", color: "text-orange-500", icon: <ArrowUp className="w-5 h-5" /> };
    return { bg: "bg-purple-50", color: "text-purple-500", icon: <Percent className="w-5 h-5" /> };
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] pb-8">
      {/* Header */}
      <div className="bg-white flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <button onClick={() => router.back()} className="p-1"><ChevronLeft className="w-6 h-6" /></button>
        <h1 className="text-[17px] font-bold">Transactions</h1>
        <button className="text-[#00A651] text-[14px] font-semibold">Download</button>
      </div>

      {/* Filters */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => { setShowCat(!showCat); setShowStatus(false); }}
            className={`flex items-center justify-between px-4 py-3 rounded-xl text-[14px] font-semibold border ${showCat ? "border-[#00A651] text-[#00A651] bg-green-50" : "border-gray-200 text-gray-600 bg-white"}`}>
            {catFilter} <ChevronDown className={`w-4 h-4 transition-transform ${showCat ? "rotate-180" : ""}`} />
          </button>
          <button onClick={() => { setShowStatus(!showStatus); setShowCat(false); }}
            className={`flex items-center justify-between px-4 py-3 rounded-xl text-[14px] font-semibold border ${showStatus ? "border-[#00A651] text-[#00A651] bg-green-50" : "border-gray-200 text-gray-600 bg-white"}`}>
            {statusFilter} <ChevronDown className={`w-4 h-4 transition-transform ${showStatus ? "rotate-180" : ""}`} />
          </button>
        </div>

        {showCat && (
          <div className="mt-3 bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => { setCatFilter(c); setShowCat(false); }}
                  className={`px-4 py-2 rounded-full text-[13px] font-medium border ${catFilter === c ? "border-[#00A651] text-[#00A651] bg-green-50" : "border-gray-200 text-gray-600"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {showStatus && (
          <div className="mt-3 bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            <div className="flex flex-wrap gap-2">
              {STATUSES.map(s => (
                <button key={s} onClick={() => { setStatusFilter(s); setShowStatus(false); }}
                  className={`px-4 py-2 rounded-full text-[13px] font-medium border ${statusFilter === s ? "border-[#00A651] text-[#00A651] bg-green-50" : "border-gray-200 text-gray-600"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold">Jun</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
          <button className="bg-[#00A651] text-white px-5 py-2 rounded-full text-[13px] font-semibold">Analysis</button>
        </div>
        <div className="flex items-center gap-6 text-[13px]">
          <span className="text-gray-500">In <span className="text-[#00A651] font-semibold">₦{totalIn.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></span>
          <span className="text-gray-500">Out <span className="font-semibold">₦{totalOut.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></span>
        </div>
      </div>

      {/* Transaction List */}
      <div className="mx-4 mt-3 bg-white rounded-2xl shadow-sm overflow-hidden">
        {txs.map((tx: Record<string, unknown>, i: number) => {
          const t = getIcon(tx.type as string);
          const isDebit = tx.type === "SEND" || tx.type === "WITHDRAW";
          const desc = tx.type === "DEPOSIT" ? "Deposit" : tx.type === "SEND" ? `Transfer to ${tx.counterparty || "User"}` : "Withdrawal";
          const date = new Date(tx.createdAt as string);
          const dateStr = date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + ", " + date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
          return (
            <div key={i} className={`flex items-center px-4 py-3.5 ${i < txs.length - 1 ? "border-b border-gray-50" : ""}`}>
              <div className={`w-[44px] h-[44px] rounded-full ${t.bg} flex items-center justify-center mr-3 flex-shrink-0 ${t.color} border border-gray-100`}>
                {t.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold truncate">{desc}</div>
                <div className="text-[12px] text-gray-400 mt-0.5">{dateStr}</div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <div className={`font-bold text-[15px] ${isDebit ? "text-gray-800" : "text-[#00A651]"}`}>
                  {isDebit ? "-" : "+"}₦{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <CheckCircle className="w-3 h-3 text-[#00A651]" />
                  <span className="text-[11px] text-[#00A651] font-medium">Successful</span>
                </div>
              </div>
            </div>
          );
        })}
        {txs.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-[14px]">No transactions yet</p>
          </div>
        )}
      </div>
    </div>
  );
}