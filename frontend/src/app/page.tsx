"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Wallet, Shield, Headset, ScanLine, Bell, Eye, EyeOff,
  ChevronRight, ArrowDown, ArrowUp, ArrowRightFromLine,
  Building, User, Receipt, Signal, Wifi, Trophy, Tv,
  Lock, HandCoins, Gift, MoreHorizontal, CircleCheck
} from "lucide-react";

const API = "https://wallet-app-xqtq.onrender.com";

// ─── API Helper ────────────────────────────────────────────────
async function api(method: string, path: string, body?: Record<string, unknown>, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(API + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ─── Auth Screen ───────────────────────────────────────────────
function AuthScreen({ onSuccess }: { onSuccess: (t: string, n: string) => void }) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setMsg({ text: "", type: "" });
    try {
      if (tab === "register") {
        if (!name || !email || !password) throw new Error("Fill all fields");
        if (password.length < 6) throw new Error("Password must be at least 6 characters");
        const data = await api("POST", "/auth/register", { name, email, password });
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.user.name);
        onSuccess(data.token, data.user.name);
      } else {
        if (!email || !password) throw new Error("Fill all fields");
        const data = await api("POST", "/auth/login", { email, password });
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.user.name);
        onSuccess(data.token, data.user.name);
      }
    } catch (e: unknown) {
      setMsg({ text: e instanceof Error ? e.message : "Error", type: "error" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5"
      style={{ background: "linear-gradient(160deg, #00A651 0%, #007B3A 100%)" }}>
      <div className="bg-white rounded-3xl p-8 w-full max-w-[400px] shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-7">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #00C853, #00A651)" }}>
            <Wallet className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-[22px] font-[800]">Walleo</h1>
          <p className="text-[13px] text-gray-500 mt-1">Send, receive & manage your money</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          {(["login", "register"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-[10px] text-[14px] font-semibold transition-all ${
                tab === t ? "bg-white text-[#00A651] shadow-sm" : "text-gray-500"}`}>
              {t === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="flex flex-col gap-3.5">
          {tab === "register" && (
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-gray-400" />
              <input type="text" placeholder="Full name" value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border-[1.5px] border-gray-200 rounded-xl text-[14px] outline-none bg-gray-50 focus:border-[#00A651] focus:shadow-[0_0_0_3px_rgba(0,166,81,0.1)] focus:bg-white transition-all" />
            </div>
          )}
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            <input type="email" placeholder="Email address" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border-[1.5px] border-gray-200 rounded-xl text-[14px] outline-none bg-gray-50 focus:border-[#00A651] focus:shadow-[0_0_0_3px_rgba(0,166,81,0.1)] focus:bg-white transition-all" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-gray-400" />
            <input type="password" placeholder="Password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border-[1.5px] border-gray-200 rounded-xl text-[14px] outline-none bg-gray-50 focus:border-[#00A651] focus:shadow-[0_0_0_3px_rgba(0,166,81,0.1)] focus:bg-white transition-all" />
          </div>
          <button onClick={handleSubmit} disabled={loading}
            className="py-3.5 rounded-xl text-[15px] font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #00C853, #00A651)" }}>
            {loading ? "Please wait..." : tab === "login" ? "Sign In" : "Create Account"}
          </button>
          {msg.text && (
            <div className={`px-3.5 py-2.5 rounded-xl text-[13px] ${
              msg.type === "error" ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-600 border border-green-200"
            }`}>{msg.text}</div>
          )}
        </div>
        <p className="text-center text-[12px] text-gray-400 mt-5">Secured with end-to-end encryption</p>
      </div>
    </div>
  );
}

// ─── PIN Screen ────────────────────────────────────────────────
function PinScreen({ onDone }: { onDone: () => void }) {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token") || "";

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newPin = [...pin];
    newPin[i] = val.slice(-1);
    setPin(newPin);
    if (val && i < 3) {
      const next = document.getElementById(`pin-${i + 1}`) as HTMLInputElement;
      next?.focus();
    }
  };

  const submit = async () => {
    const p = pin.join("");
    if (p.length !== 4) { setMsg("Enter all 4 digits"); return; }
    setLoading(true);
    try {
      await api("POST", "/auth/set-pin", { pin: p }, token);
      onDone();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5"
      style={{ background: "linear-gradient(160deg, #00A651 0%, #007B3A 100%)" }}>
      <div className="bg-white rounded-3xl p-8 w-full max-w-[400px] shadow-2xl text-center">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg"
          style={{ background: "linear-gradient(135deg, #00C853, #00A651)" }}>
          <Shield className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-[22px] font-[800] mb-1.5">Set Your PIN</h1>
        <p className="text-[13px] text-gray-500 mb-6">Create a 4-digit PIN to authorize transactions</p>
        <div className="flex gap-3 justify-center mb-6">
          {pin.map((v, i) => (
            <input key={i} id={`pin-${i}`} type="password" maxLength={1} value={v}
              onChange={(e) => handleChange(i, e.target.value)}
              className="pin-dot" />
          ))}
        </div>
        <button onClick={submit} disabled={loading}
          className="w-full py-3.5 rounded-xl text-[15px] font-semibold text-white transition-all disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #00C853, #00A651)" }}>
          {loading ? "Setting..." : "Set PIN"}
        </button>
        {msg && <p className="text-red-500 text-[13px] mt-3">{msg}</p>}
      </div>
    </div>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────
function Dashboard({ token, userName, onLogout }: { token: string; userName: string; onLogout: () => void }) {
  const [balance, setBalance] = useState(0);
  const [hideBalance, setHideBalance] = useState(false);
  const [transactions, setTransactions] = useState<Record<string, unknown>[]>([]);
  const [modal, setModal] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [pin, setPin] = useState("");
  const [modalMsg, setModalMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const b = await api("GET", "/wallet/balance", undefined, token);
      setBalance(Number(b.balance));
      const t = await api("GET", "/wallet/transactions", undefined, token);
      setTransactions(t);
    } catch {
      onLogout();
    }
  }, [token, onLogout]);

  useEffect(() => { refresh(); }, [refresh]);

  const doAction = async () => {
    setLoading(true);
    setModalMsg({ text: "", type: "" });
    try {
      if (modal === "deposit") {
        await api("POST", "/wallet/deposit", { amount: Number(amount) }, token);
        setModalMsg({ text: `Deposited ₦${Number(amount).toLocaleString()} successfully`, type: "success" });
      } else if (modal === "send") {
        if (!recipient) throw new Error("Enter recipient name");
        if (!pin || pin.length !== 4) throw new Error("Enter your 4-digit PIN");
        await api("POST", "/wallet/send", { amount: Number(amount), recipient, pin }, token);
        setModalMsg({ text: `Sent ₦${Number(amount).toLocaleString()} to ${recipient}`, type: "success" });
      } else if (modal === "withdraw") {
        if (!pin || pin.length !== 4) throw new Error("Enter your 4-digit PIN");
        await api("POST", "/wallet/withdraw", { amount: Number(amount), pin }, token);
        setModalMsg({ text: `Withdrew ₦${Number(amount).toLocaleString()} successfully`, type: "success" });
      }
      setAmount(""); setRecipient(""); setPin("");
      refresh();
    } catch (e: unknown) {
      setModalMsg({ text: e instanceof Error ? e.message : "Error", type: "error" });
    }
    setLoading(false);
  };

  const txIcon = (type: string) => {
    if (type === "DEPOSIT") return { bg: "bg-emerald-50", color: "text-emerald-500", icon: <ArrowDown className="w-4 h-4" /> };
    return { bg: "bg-green-50", color: "text-[#00A651]", icon: <ArrowUp className="w-4 h-4" /> };
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] pb-24">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center border-2 border-[#00C853] relative">
            <User className="w-5 h-5 text-gray-400" />
            <div className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] bg-[#FFB800] rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-[7px] text-white">★</span>
            </div>
          </div>
          <h2 className="text-[16px] font-bold">Hi, <span className="text-[#00A651]">{userName}</span></h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-[38px] h-[38px] bg-white rounded-[10px] flex items-center justify-center shadow-sm cursor-pointer">
            <Headset className="w-[18px] h-[18px] text-gray-600" />
            <span className="absolute -top-1.5 -right-2 bg-[#EF4444] text-white text-[7px] font-bold px-1 rounded">HELP</span>
          </div>
          <div className="w-[38px] h-[38px] bg-white rounded-[10px] flex items-center justify-center shadow-sm cursor-pointer">
            <ScanLine className="w-[18px] h-[18px] text-gray-600" />
          </div>
          <div className="relative w-[38px] h-[38px] bg-white rounded-[10px] flex items-center justify-center shadow-sm cursor-pointer">
            <Bell className="w-[18px] h-[18px] text-gray-600" />
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">44</span>
          </div>
        </div>
      </div>

      {/* ─── Balance Card ─── */}
      <div className="mx-4 mt-3 balance-gradient rounded-[20px] p-5 text-white shadow-xl">
        <div className="flex justify-between items-center mb-2.5 relative z-10">
          <div className="flex items-center gap-2 text-[13px] font-medium opacity-95">
            <CircleCheck className="w-4 h-4 text-emerald-300" /> Available Balance
            <button onClick={() => setHideBalance(!hideBalance)} className="opacity-80">
              {hideBalance ? <EyeOff className="w-[14px] h-[14px]" /> : <Eye className="w-[14px] h-[14px]" />}
            </button>
          </div>
          <span className="text-[13px] font-medium opacity-90 flex items-center gap-1 cursor-pointer">
            Transaction History <ChevronRight className="w-3 h-3" />
          </span>
        </div>
        <div className={`text-[36px] font-black tracking-tight relative z-10 mb-3.5 ${hideBalance ? "opacity-40 text-[28px] tracking-[4px]" : ""}`}>
          {hideBalance ? "₦ ••••••" : `₦${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        </div>
        <button onClick={() => setModal("deposit")}
          className="relative z-10 float-right bg-white/20 backdrop-blur-sm border border-white/30 text-white px-5 py-2.5 rounded-xl text-[14px] font-semibold hover:bg-white/30 active:scale-95 transition-all">
          + Add Money
        </button>
        <div className="clear-both" />
      </div>

      {/* ─── Recent Transactions ─── */}
      <div className="mx-4 mt-3 bg-white rounded-2xl p-4">
        <div className="flex justify-between items-center mb-3.5">
          <h3 className="text-[15px] font-bold">Recent Transactions</h3>
          <span className="text-[13px] text-[#00A651] font-semibold cursor-pointer">See All</span>
        </div>
        {transactions.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <Receipt className="w-9 h-9 mx-auto mb-2 opacity-40" />
            <p className="text-[13px]">No transactions yet</p>
          </div>
        ) : (
          transactions.slice(0, 5).map((tx: Record<string, unknown>, i: number) => {
            const t = txIcon(tx.type as string);
            const isDebit = tx.type === "SEND" || tx.type === "WITHDRAW";
            const desc = tx.type === "DEPOSIT" ? "Deposit" : tx.type === "SEND" ? `Transfer to ${tx.counterparty || "User"}` : "Withdrawal";
            const date = new Date(tx.createdAt as string);
            return (
              <div key={i} className="flex items-center py-3 border-b border-gray-50 last:border-0">
                <div className={`w-[42px] h-[42px] rounded-full ${t.bg} flex items-center justify-center mr-3 flex-shrink-0 ${t.color}`}>{t.icon}</div>
                <div className="flex-1">
                  <div className="text-[14px] font-semibold">{desc}</div>
                  <div className="text-[12px] text-gray-400 mt-0.5">{date.toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-[15px] ${isDebit ? "text-red-500" : "text-[#00A651]"}`}>
                    {isDebit ? "-" : "+"}₦{Number(tx.amount).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-[#00A651] font-semibold mt-0.5">Successful</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ─── Quick Actions ─── */}
      <div className="mx-4 mt-3 bg-white rounded-2xl py-4 px-3">
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { icon: <User className="w-[18px] h-[18px] text-[#00A651]" />, label: "To User", action: "send" },
            { icon: <Building className="w-[18px] h-[18px] text-[#00A651]" />, label: "To Bank", action: "send" },
            { icon: <ArrowRightFromLine className="w-[18px] h-[18px] text-[#00A651]" />, label: "Withdraw", action: "withdraw" },
          ].map((a) => (
            <button key={a.label} onClick={() => setModal(a.action)}
              className="action-btn flex flex-col items-center gap-2 py-2 rounded-xl cursor-pointer bg-transparent border-none">
              <div className="w-12 h-12 rounded-[14px] bg-green-50 flex items-center justify-center">{a.icon}</div>
              <span className="text-[12px] font-semibold text-gray-700">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── BVN Banner ─── */}
      <div className="mx-4 mt-3 bg-white rounded-2xl p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-[22px] flex-shrink-0">🪪</div>
        <div className="flex-1">
          <h4 className="text-[14px] font-semibold">Verify your identity</h4>
          <p className="text-[12px] text-gray-500 mt-0.5">Complete your BVN and NIN verification</p>
        </div>
        <button className="bg-[#00A651] text-white px-5 py-2.5 rounded-[10px] text-[13px] font-semibold">Go</button>
      </div>

      {/* ─── Services Grid ─── */}
      <div className="mx-4 mt-3 bg-white rounded-2xl p-4">
        <h3 className="text-[15px] font-bold mb-3.5">Services</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: <Signal className="w-[18px] h-[18px] text-[#00A651]" />, label: "Airtime", badge: "Up to 6%" },
            { icon: <Wifi className="w-[18px] h-[18px] text-[#00A651]" />, label: "Data" },
            { icon: <Trophy className="w-[18px] h-[18px] text-[#00A651]" />, label: "Betting" },
            { icon: <Tv className="w-[18px] h-[18px] text-[#00A651]" />, label: "TV" },
            { icon: <Lock className="w-[18px] h-[18px] text-[#00A651]" />, label: "SafeBox" },
            { icon: <HandCoins className="w-[18px] h-[18px] text-[#00A651]" />, label: "Loan" },
            { icon: <Gift className="w-[18px] h-[18px] text-[#00A651]" />, label: "Invitation" },
            { icon: <MoreHorizontal className="w-[18px] h-[18px] text-[#00A651]" />, label: "More" },
          ].map((s) => (
            <div key={s.label} className="service-item text-center py-2 rounded-xl cursor-pointer relative">
              {s.badge && (
                <span className="absolute top-0 right-1 bg-[#EF4444] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap">{s.badge}</span>
              )}
              <div className="w-12 h-12 rounded-[14px] bg-green-50 flex items-center justify-center mx-auto mb-1.5">{s.icon}</div>
              <span className="text-[11px] font-semibold text-gray-700">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Saving Challenge ─── */}
      <div className="mx-4 mt-3 mb-4 rounded-2xl px-5 py-4 flex items-center justify-between text-white"
        style={{ background: "linear-gradient(135deg, #00A651, #007B3A)" }}>
        <h3 className="text-[16px] font-bold">Saving Challenge 2026</h3>
        <span className="text-[28px]">🎯</span>
      </div>

      {/* ─── Bottom Nav ─── */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white flex justify-around py-2 pb-3 border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
        {[
          { icon: <Wallet className="w-5 h-5" />, label: "Home", active: true },
          { icon: <Trophy className="w-5 h-5" />, label: "Rewards" },
          { icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>, label: "Finance" },
          { icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>, label: "Cards" },
          { icon: <User className="w-5 h-5" />, label: "Me" },
        ].map((n) => (
          <button key={n.label}
            className={`nav-item flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl bg-transparent border-none cursor-pointer ${n.active ? "active font-bold" : "text-gray-400 font-medium"}`}>
            {n.icon}
            <span className="text-[11px]">{n.label}</span>
          </button>
        ))}
      </div>

      {/* ─── Modal ─── */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-[100] p-5"
          onClick={() => { setModal(null); setModalMsg({ text: "", type: "" }); }}>
          <div className="bg-white rounded-t-3xl p-6 pb-8 w-full max-w-[430px] modal-enter"
            onClick={(e) => e.stopPropagation()}>
            <div className="w-9 h-1 bg-gray-200 rounded mx-auto mb-5" />
            <h2 className="text-[18px] font-bold mb-1 flex items-center gap-2.5">
              {modal === "deposit" && <><ArrowDown className="w-5 h-5 text-[#00A651]" /> Deposit</>}
              {modal === "send" && <><ArrowUp className="w-5 h-5 text-[#00A651]" /> Send Money</>}
              {modal === "withdraw" && <><ArrowRightFromLine className="w-5 h-5 text-[#f59e0b]" /> Withdraw</>}
            </h2>
            <p className="text-[13px] text-gray-500 mb-5">
              {modal === "deposit" ? "Add money to your wallet" : "Enter your PIN to authorize"}
            </p>
            <div className="flex flex-col gap-3">
              <input type="number" placeholder="Amount (NGN)" value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3.5 border-[1.5px] border-gray-200 rounded-xl text-[14px] outline-none bg-gray-50 focus:border-[#00A651] focus:bg-white transition-all" />
              {modal === "send" && (
                <input type="text" placeholder="Recipient name" value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-4 py-3.5 border-[1.5px] border-gray-200 rounded-xl text-[14px] outline-none bg-gray-50 focus:border-[#00A651] focus:bg-white transition-all" />
              )}
              {(modal === "send" || modal === "withdraw") && (
                <input type="password" placeholder="4-digit PIN" maxLength={4} value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full px-4 py-3.5 border-[1.5px] border-gray-200 rounded-xl text-[14px] outline-none bg-gray-50 focus:border-[#00A651] focus:bg-white transition-all" />
              )}
              <button onClick={doAction} disabled={loading}
                className="w-full py-3.5 rounded-xl text-[15px] font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #00C853, #00A651)" }}>
                {loading ? "Processing..." : modal === "deposit" ? "Deposit" : modal === "send" ? "Send" : "Withdraw"}
              </button>
            </div>
            {modalMsg.text && (
              <div className={`mt-3 px-3.5 py-2.5 rounded-xl text-[13px] ${
                modalMsg.type === "error" ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-600 border border-green-200"
              }`}>{modalMsg.text}</div>
            )}
            <button onClick={() => { setModal(null); setModalMsg({ text: "", type: "" }); }}
              className="w-full text-center text-[14px] text-gray-500 mt-3 py-2 bg-transparent border-none cursor-pointer">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────
export default function Home() {
  const [screen, setScreen] = useState<"auth" | "pin" | "dash">("auth");
  const [token, setToken] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("token");
    const n = localStorage.getItem("userName");
    if (t) {
      setToken(t);
      setUserName(n || "User");
      setScreen("dash");
    }
  }, []);

  const handleAuth = (t: string, n: string) => {
    setToken(t);
    setUserName(n);
    setScreen("pin");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setToken("");
    setScreen("auth");
  };

  if (screen === "auth") return <AuthScreen onSuccess={handleAuth} />;
  if (screen === "pin") return <PinScreen onDone={() => setScreen("dash")} />;
  return <Dashboard token={token} userName={userName} onLogout={handleLogout} />;
}