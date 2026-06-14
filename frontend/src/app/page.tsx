"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet, Shield, Headset, ScanLine, Bell, Eye, EyeOff,
  ChevronRight, ArrowDown, ArrowUp, ArrowRightFromLine,
  Building, User, Receipt, Signal, Wifi, Trophy, Tv,
  Lock, HandCoins, Gift, MoreHorizontal, CircleCheck, Check,
  Phone, Mail, ChevronDown, Loader2, AlertCircle, X
} from "lucide-react";

const API = "https://wallet-app-xqtq.onrender.com";

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

/* ─── OPay‑inspired Auth Screen ─── */
function AuthScreen({ onSuccess }: { onSuccess: (t: string, n: string) => void }) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const phoneDisplay = phone ? `+234 ${phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3")}` : "";

  const handleSubmit = async () => {
    setLoading(true);
    setMsg({ text: "", type: "" });
    try {
      if (tab === "register") {
        if (!name || !phone || !email || !password) throw new Error("Please fill in all fields");
        if (password.length < 6) throw new Error("Password must be at least 6 characters");
        if (password.length < 8) throw new Error("Password must be at least 8 characters for security");
        if (!agreeTerms) throw new Error("Please agree to the Terms & Conditions");
        // Phone used as unique login identifier (formatted as email for API compatibility)
        const data = await api("POST", "/auth/register", { name, email: `${phone}@walleo.app`, password });
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.user.name);
        setStep("success");
        setTimeout(() => onSuccess(data.token, data.user.name), 1500);
      } else {
        if (!phone || !password) throw new Error("Please enter your phone number and password");
        const data = await api("POST", "/auth/login", { email: phone, password });
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.user.name);
        setStep("success");
        setTimeout(() => onSuccess(data.token, data.user.name), 1500);
      }
    } catch (e: unknown) {
      setMsg({ text: e instanceof Error ? e.message : "Something went wrong", type: "error" });
    }
    setLoading(false);
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[i] = val.slice(-1);
    setOtp(newOtp);
    if (val && i < 5) {
      otpRefs.current[i + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
  };

  const passwordStrength = (pw: string) => {
    if (!pw) return { label: "", color: "", width: "0%" };
    const score = [pw.length >= 8, /[A-Z]/.test(pw), /[a-z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
    if (score <= 2) return { label: "Weak", color: "#EF4444", width: "33%" };
    if (score <= 3) return { label: "Medium", color: "#F59E0B", width: "66%" };
    return { label: "Strong", color: "#00C853", width: "100%" };
  };

  const strength = passwordStrength(password);

  /* ─── Success overlay ─── */
  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-5"
        style={{ background: "linear-gradient(160deg, #00A651 0%, #007B3A 100%)" }}>
        <div className="bg-white rounded-3xl p-10 w-full max-w-[380px] shadow-2xl text-center">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5 animate-bounce-in">
            <div className="w-14 h-14 rounded-full bg-[#00A651] flex items-center justify-center">
              <Check className="w-7 h-7 text-white" />
            </div>
          </div>
          <h2 className="text-[24px] font-[800] mb-2">{tab === "register" ? "Account Created!" : "Welcome Back!"}</h2>
          <p className="text-[14px] text-gray-400">Redirecting to your dashboard...</p>
          <div className="mt-6 flex justify-center">
            <div className="w-8 h-8 border-2 border-[#00A651] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  /* ─── Form ─── */
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #00A651 0%, #007B3A 100%)" }}>
      {/* Decorative circles */}
      <div className="absolute top-[-80px] right-[-80px] w-[260px] h-[260px] rounded-full bg-white/5" />
      <div className="absolute bottom-[-60px] left-[-60px] w-[200px] h-[200px] rounded-full bg-white/5" />
      <div className="absolute top-[40%] left-[-30px] w-[100px] h-[100px] rounded-full bg-white/5" />

      <div className="bg-white rounded-[28px] p-7 sm:p-8 w-full max-w-[400px] shadow-[0_25px_60px_rgba(0,0,0,0.3)] relative z-10 animate-fade-up">
        {/* Brand Header */}
        <div className="text-center mb-7">
          <div className="w-[60px] h-[60px] rounded-[16px] mx-auto mb-3.5 flex items-center justify-center shadow-lg relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #00C853, #00A651)" }}>
            <div className="absolute inset-0 bg-white/10" />
            <Wallet className="w-7 h-7 text-white relative z-10" />
          </div>
          <h1 className="text-[24px] font-[800] tracking-tight text-gray-900">Walleo</h1>
          <p className="text-[13px] text-gray-400 mt-1 font-medium">Send, receive & manage your money</p>
        </div>

        {/* Tab Switcher - OPay style */}
        <div className="relative bg-gray-100 rounded-[14px] p-1 mb-7">
          <div className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-out"
            style={{ transform: `translateX(${tab === "login" ? "0%" : "100%"})` }} />
          {(["login", "register"] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setMsg({ text: "", type: "" }); }}
              className="relative z-10 flex-1 py-2.5 rounded-[12px] text-[14px] font-semibold transition-all duration-200 bg-transparent border-none cursor-pointer"
              style={{ color: tab === t ? "#00A651" : "#9CA3AF" }}>
              {t === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-3.5">
          {/* Name field (register only) */}
          {tab === "register" && (
            <div className="relative animate-slide-down">
              <div className={`input-wrapper ${focused === "name" ? "input-focused" : ""}`}>
                <div className="input-icon">
                  <User className="w-[18px] h-[18px] text-gray-400" />
                </div>
                <input type="text" placeholder="Full name" value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused(null)}
                  className="app-input" />
              </div>
            </div>
          )}

          {/* Phone field */}
          <div className={`relative ${tab === "register" ? "animate-slide-down-delay-1" : ""}`}>
            <div className={`input-wrapper ${focused === "phone" ? "input-focused" : ""}`}>
              <div className="input-icon pl-2 pr-1 flex items-center gap-0.5 border-r border-gray-200 mr-1">
                <span className="text-[14px]">🇳🇬</span>
                <span className="text-[13px] font-medium text-gray-600">+234</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </div>
              <input type="tel" placeholder="Phone number" maxLength={11} value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                onFocus={() => setFocused("phone")}
                onBlur={() => setFocused(null)}
                className="app-input pl-2" />
            </div>
          </div>

          {/* Email field (register only) */}
          {tab === "register" && (
            <div className="relative animate-slide-down-delay-2">
              <div className={`input-wrapper ${focused === "email" ? "input-focused" : ""}`}>
                <div className="input-icon">
                  <Mail className="w-[18px] h-[18px] text-gray-400" />
                </div>
                <input type="email" placeholder="Email address (optional)" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  className="app-input" />
              </div>
            </div>
          )}

          {/* Password field */}
          <div className={`relative ${tab === "register" ? "animate-slide-down-delay-3" : ""}`}>
            <div className={`input-wrapper ${focused === "password" ? "input-focused" : ""}`}>
              <div className="input-icon">
                <Lock className="w-[18px] h-[18px] text-gray-400" />
              </div>
              <input type={showPassword ? "text" : "password"} placeholder="Password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                className="app-input" />
              <button onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-1 text-gray-400 hover:text-gray-600 transition-colors">
                {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
              </button>
            </div>
            {/* Password strength bar (register only) */}
            {tab === "register" && password && (
              <div className="mt-2 animate-slide-down">
                <div className="flex items-center gap-2.5">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: strength.width, background: strength.color }} />
                  </div>
                  <span className="text-[11px] font-semibold" style={{ color: strength.color }}>{strength.label}</span>
                </div>
                <ul className="mt-2 space-y-1">
                  {[
                    { label: "At least 8 characters", met: password.length >= 8 },
                    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
                    { label: "Contains a number", met: /[0-9]/.test(password) },
                  ].map((req, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-[11px]"
                      style={{ color: req.met ? "#00A651" : "#9CA3AF" }}>
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${req.met ? "bg-green-50" : "bg-gray-100"}`}>
                        {req.met ? <Check className="w-2.5 h-2.5 text-[#00A651]" /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
                      </div>
                      {req.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Forgot password (login only) */}
          {tab === "login" && (
            <div className="text-right">
              <button className="text-[12px] font-semibold text-[#00A651] hover:text-[#008C46] transition-colors bg-transparent border-none cursor-pointer">
                Forgot Password?
              </button>
            </div>
          )}

          {/* Terms (register only) */}
          {tab === "register" && (
            <div className="flex items-start gap-2.5 mt-1 animate-slide-down-delay-4">
              <button onClick={() => setAgreeTerms(!agreeTerms)}
                className={`w-[18px] h-[18px] rounded-[4px] flex items-center justify-center flex-shrink-0 mt-0.5 transition-all border-2 cursor-pointer ${agreeTerms ? "bg-[#00A651] border-[#00A651]" : "border-gray-300 bg-white"}`}>
                {agreeTerms && <Check className="w-3 h-3 text-white" />}
              </button>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                By creating an account, you agree to our{" "}
                <span className="font-semibold text-[#00A651] cursor-pointer hover:underline">Terms of Service</span>{" "}
                and{" "}
                <span className="font-semibold text-[#00A651] cursor-pointer hover:underline">Privacy Policy</span>
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-3.5 rounded-[14px] text-[15px] font-semibold text-white relative overflow-hidden transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-[0_4px_20px_rgba(0,166,81,0.4)] active:scale-[0.98] cursor-pointer border-none"
            style={{ background: "linear-gradient(135deg, #00C853, #00A651)" }}>
            <div className="absolute inset-0 bg-white/0 hover:bg-white/10 transition-all duration-300" />
            {loading ? (
              <span className="flex items-center justify-center gap-2.5">
                <Loader2 className="w-5 h-5 animate-spin" />
                {tab === "login" ? "Signing in..." : "Creating account..."}
              </span>
            ) : (
              tab === "login" ? "Sign In" : "Create Account"
            )}
          </button>

          {/* Error / Success Message */}
          {msg.text && (
            <div className={`flex items-start gap-2 px-3.5 py-3 rounded-[12px] text-[13px] font-medium animate-slide-down ${msg.type === "error" ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-600 border border-green-200"}`}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{msg.text}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-center text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Secured with end-to-end encryption • SEC licensed
          </p>
        </div>
      </div>
    </div>
  );
}

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

function Dashboard({ token, userName, onLogout }: { token: string; userName: string; onLogout: () => void }) {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [hideBalance, setHideBalance] = useState(false);
  const [transactions, setTransactions] = useState<Record<string, unknown>[]>([]);
  const [modal, setModal] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [pin, setPin] = useState("");
  const [modalMsg, setModalMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

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
    <div className="min-h-screen bg-[#f0f0f0] pb-24 pt-6">
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
            <span className="absolute -top-1.5 -right-2 bg-[#EF4444] text-white text-[7px] font-bold px-1.5 rounded-sm">HELP</span>
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
          <span className="text-[13px] font-medium opacity-90 flex items-center gap-1 cursor-pointer" onClick={() => router.push("/transactions")}>
            Transaction History <ChevronRight className="w-3 h-3" />
          </span>
        </div>
        <div className={`text-[36px] font-medium tracking-tight relative z-10 mb-3.5 ${hideBalance ? "opacity-40 text-[28px] tracking-[4px]" : ""}`}>
          {hideBalance ? "₦ ••••••" : `₦${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        </div>
        <button onClick={() => setModal("deposit")}
          className="relative z-10 float-right bg-white/20 backdrop-blur-sm border border-white/30 text-white px-5 py-2.5 rounded-xl text-[14px] font-semibold hover:bg-white/30 active:scale-95 transition-all">
          + Add Money
        </button>
        <div className="clear-both" />
      </div>

      {/* ─── Recent Transactions (show 2 only) ─── */}
      <div className="mx-4 mt-3 bg-white rounded-2xl p-4">
        <div className="flex justify-between items-center mb-3.5">
          <h3 className="text-[15px] font-bold">Recent Transactions</h3>
          <span className="text-[13px] text-[#00A651] font-semibold cursor-pointer" onClick={() => router.push("/transactions")}>See All</span>
        </div>
        {transactions.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <Receipt className="w-9 h-9 mx-auto mb-2 opacity-40" />
            <p className="text-[13px]">No transactions yet</p>
          </div>
        ) : (
          transactions.slice(0, 2).map((tx: Record<string, unknown>, i: number) => {
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

      {/* ─── Bottom Nav ─── */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white flex justify-around py-2 pb-3 border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
        {[
          { icon: <Wallet className="w-5 h-5" />, label: "Home", active: true },
          { icon: <Trophy className="w-5 h-5" />, label: "Rewards" },
          { icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>, label: "Finance" },
          { icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>, label: "Cards" },
          { icon: <User className="w-5 h-5" />, label: "Me" },
        ].map((n) => (
          <button key={n.label} onClick={n.label === "Me" ? () => setShowLogout(true) : undefined}
            className={`nav-item flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl bg-transparent border-none cursor-pointer ${n.active ? "active font-bold" : "text-gray-400 font-medium"}`}>
            {n.icon}
            <span className="text-[11px]">{n.label}</span>
          </button>
        ))}
      </div>

      {/* ─── Logout Confirm Modal ─── */}
      {showLogout && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-5"
          onClick={() => setShowLogout(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-[320px] text-center shadow-2xl modal-enter"
            onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <User className="w-7 h-7 text-red-500" />
            </div>
            <h2 className="text-[18px] font-bold mb-1">Logout</h2>
            <p className="text-[13px] text-gray-500 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogout(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-[14px] font-semibold text-gray-600 bg-transparent cursor-pointer">Cancel</button>
              <button onClick={() => { onLogout(); setShowLogout(false); }}
                className="flex-1 py-3 rounded-xl text-[14px] font-semibold text-white bg-red-500 cursor-pointer">Yes, Logout</button>
            </div>
          </div>
        </div>
      )}

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
              <div className={`mt-3 px-3.5 py-2.5 rounded-xl text-[13px] ${modalMsg.type === "error" ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-600 border border-green-200"}`}>{modalMsg.text}</div>
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