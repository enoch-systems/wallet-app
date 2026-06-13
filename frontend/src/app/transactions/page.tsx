"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronDown, Download, ArrowDown, ArrowUp, TrendingUp, Gift, Smartphone, Wifi, Zap, BarChart3 } from "lucide-react";

const API = "https://wallet-app-xqtq.onrender.com";

async function api(method: string, path: string, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(API + path, { method, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

const CATEGORIES = ["All Categories", "Transfer to", "Transfer from", "Deposit", "Withdrawal", "Airtime", "Data", "Betting", "TV", "Electricity", "Add Money"];
const STATUSES = ["All Status", "Successful", "Pending", "Failed", "Reversed"];

const txTypeIcon = (type: string) => {
  if (type === "DEPOSIT") return { bg: "bg-emerald-50", color: "text-emerald-500", icon: <ArrowDown className="w-4 h-4" />, border: "border-emerald-200" };
  if (type === "SEND") return { bg: "bg-green-50", color: "text-[#00A651]", icon: <ArrowUp className="w-4 h-4" />, border: "border-green-200" };
  if (type === "WITHDRAW") return { bg: "bg-orange-50", color: "text-orange-500", icon: <TrendingUp className="w-4 h-4" />, border: "border-orange-200" };
  return { bg: "bg-blue-50", color: "text-blue-500", icon: <Smartphone className="w-4 h-4" />, border: "border-blue-200" };
};

export default function TransactionsPage() {
  const [txs, setTxs] = useState<Record<string, unknown>[]>([]);
  const [catFilter, setCatFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [showCat, setShowCat] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const refresh = useCallback(async () => {
    try {
      const data = await api("GET", "/wallet/transactions", token || undefined);
      setTxs(data);
    } catch { }
  }, [token]);

  useEffect(() => { refresh(); }, [refresh]);

  const totalIn = txs.filter(tx => tx.type === "DEPOSIT").reduce((s, tx) => s + Number(tx.amount), 0);
  const totalOut = txs.filter(tx => tx.type === "SEND" || tx.type === "WITHDRAW").reduce((s, tx) => s + Number(tx.amount), 0);

  return (
    <div className="min-h-screen bg-[#f0f0f0] pb-8">
      {/* Header */}
      <div className="bg-white flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <button onClick={() => window.history.back()} className="p-1"><ChevronLeft className="w-6 h-6" /></button>
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

        {/* Category dropdown */}
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

        {/* Status dropdown */}
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

      {/* Summary Card */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold">Jun</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
          <button className="bg-[#00A651] text-white px-4 py-2 rounded-full text-[13px] font-semibold">Analysis</button>
        </div>
        <div className="flex items-center gap-6 text-[13px]">
          <span className="text-gray-500">In <span className="text-[#00A651] font-semibold">₦{totalIn.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></span>
          <span className="text-gray-500">Out <span className="font-semibold">₦{totalOut.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></span>
        </div>
      </div>

      {/* Transaction List */}
      <div className="mx-4 mt-3 bg-white rounded-2xl shadow-sm overflow-hidden">
        {txs.filter(tx => {
          if (catFilter !== "All Categories" && tx.type !== catFilter.toUpperCase().replace(" ", "_")) return false;
          return true;
        }).map((tx: Record<string, unknown>, i: number) => {
          const t = txTypeIcon(tx.type as string);
          const isDebit = tx.type === "SEND" || tx.type === "WITHDRAW";
          const desc = tx.type === "DEPOSIT" ? "Deposit" : tx.type === "SEND" ? `Transfer to ${tx.counterparty || "User"}` : "Withdrawal";
          const date = new Date(tx.createdAt as string);
          const dateStr = date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + ", " + date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
          return (
            <div key={i} className={`flex items-center px-4 py-3.5 ${i < txs.length - 1 ? "border-b border-gray-50" : ""}`}>
              <div className={`w-[42px] h-[42px] rounded-full ${t.bg} flex items-center justify-center mr-3 flex-shrink-0 ${t.color} border ${t.border}`}>
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
                <div className="text-[11px] text-[#00A651] font-medium mt-0.5">Successful</div>
              </div>
            </div>
          );
        })}
        {txs.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-[14px]">No transactions yet</p>
          </div>
        )}
      </div>
    </div>
  );
}