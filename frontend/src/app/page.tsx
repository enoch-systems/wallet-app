"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet, Shield, Headset, ScanLine, Bell, Eye, EyeOff,
  ChevronRight, ArrowDown, ArrowUp, ArrowRightFromLine,
  Building, User, Receipt, Signal, Wifi, Trophy, Tv,
  Lock, HandCoins, Gift, MoreHorizontal, CircleCheck, Check,
  Loader2, AlertCircle, X, ArrowLeft
} from "lucide-react";

const API = "https://wallet-app-xqtq.onrender.com";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function api(method: string, path: string, body?: Record<string, unknown>, token?: string): Promise<any> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(API + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Network error. Please check your connection and try again.");
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server error (${res.status}). Please try again later.`);
  }
  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  return data;
}

/* ═══════════════════════════════════════════════════════════════════════════
   OPay‑inspired Multi‑Page Auth Screen
   
   Login flow:     Phone (10 digits) → 6-digit PIN Login → Success
   Register flow:  Phone (10 digits) → Full Name → Create 6-digit PIN → Confirm 6-digit PIN → Success → Set Transaction PIN
   ═══════════════════════════════════════════════════════════════════════════ */
function AuthScreen({ onSuccess }: { onSuccess: (t: string, n: string) => void }) {
  // ── Navigation state ──
  const [mode, setMode] = useState<"login" | "register">("login");
  const [authStep, setAuthStep] = useState<
    "phone" | "login-pin" | "reg-name" | "reg-pin" | "reg-confirm-pin" | "success"
  >("phone");

  // ── Form data ──
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");

  // ── UI state ──
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const formattedPhone = phone ? phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3") : "";
  const isPhoneValid = phone.length === 10;
  const phoneDigitCount = phone.length;

  /* ── API Submit ── */
  const handleLogin = async () => {
    setLoading(true);
    setMsg({ text: "", type: "" });
    try {
      const data = await api("POST", "/auth/login", { phone, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userPhone", data.user.phone);
      setAuthStep("success");
      setTimeout(() => onSuccess(data.token, data.user.name), 1500);
    } catch (e: unknown) {
      setMsg({ text: e instanceof Error ? e.message : "Something went wrong", type: "error" });
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    setLoading(true);
    setMsg({ text: "", type: "" });
    try {
      if (!name.trim()) throw new Error("Please enter your full name");
      if (password.length !== 6) throw new Error("PIN must be exactly 6 digits");
      if (password !== confirmPassword) throw new Error("PINs do not match");
      const data = await api("POST", "/auth/register", { name: name.trim(), phone, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userPhone", data.user.phone);
      setAuthStep("success");
      setTimeout(() => onSuccess(data.token, data.user.name), 1500);
    } catch (e: unknown) {
      setMsg({ text: e instanceof Error ? e.message : "Something went wrong", type: "error" });
    }
    setLoading(false);
  };

  /* ─── SUCCESS SCREEN ─── */
  if (authStep === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-5 bg-white">
        <div className="text-center animate-fade-up">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5 animate-bounce-in">
            <div className="w-14 h-14 rounded-full bg-[#00A651] flex items-center justify-center">
              <Check className="w-7 h-7 text-white" />
            </div>
          </div>
          <h2 className="text-[24px] font-[800] mb-2 text-gray-900">{mode === "register" ? "Account Created!" : "Welcome Back!"}</h2>
          <p className="text-[14px] text-gray-400">Redirecting to your dashboard...</p>
          <div className="mt-6 flex justify-center">
            <div className="w-8 h-8 border-2 border-[#00A651] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  /* ─── PAGE HEADER ─── */
  const renderHeader = () => (
    <div className="flex items-center justify-between px-5 pt-4 pb-2 mb-2">
      <button onClick={() => {
        if (authStep === "login-pin") { setAuthStep("phone"); setPassword(""); setMsg({ text: "", type: "" }); }
        else if (authStep === "reg-name") { setAuthStep("phone"); setMsg({ text: "", type: "" }); }
        else if (authStep === "reg-pin") { setAuthStep("reg-name"); setPassword(""); setMsg({ text: "", type: "" }); }
        else if (authStep === "reg-confirm-pin") { setAuthStep("reg-pin"); setConfirmPassword(""); setMsg({ text: "", type: "" }); }
        else { setMode("login"); setAuthStep("phone"); setPhone(""); setPassword(""); setConfirmPassword(""); setName(""); setMsg({ text: "", type: "" }); }
      }} className="bg-transparent border-none cursor-pointer p-1 text-gray-900">
        <ArrowLeft className="w-6 h-6" />
      </button>
      <span className="text-[15px] font-semibold text-[#00A651] cursor-pointer hover:underline">Help</span>
    </div>
  );

  /* ─── LOGIN: STEP 1 — PHONE NUMBER (10 digits) ─── */
  if (authStep === "phone") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {renderHeader()}

        <div className="flex-1 flex flex-col px-7 pt-6">
          {/* Logo */}
          <div className="text-center mb-8 animate-fade-up">
            <div className="inline-flex items-center justify-center">
              <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #00C853, #00A651)" }}>
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-[28px] font-[800] ml-1.5 text-gray-900">Walleo</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-[28px] font-[800] text-gray-900 mb-6 animate-fade-up">{mode === "login" ? "Log in to your account" : "Create your account"}</h1>

          {/* Phone input */}
          <div className="mb-2 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 border-r border-gray-300 pr-3">
                <span className="text-[15px]">🇳🇬</span>
                <span className="text-[14px] font-medium text-gray-600">+234</span>
              </div>
              <input type="tel" placeholder="Enter 10-digit number" maxLength={10} value={phone}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 10);
                  setPhone(digits);
                  setMsg({ text: "", type: "" });
                }}
                className={`w-full pl-[90px] pr-14 py-4 bg-gray-50 border-none rounded-2xl text-[16px] text-gray-900 outline-none placeholder:text-gray-400 transition-all ${phone.length === 10 ? "ring-2 ring-[#00A651]/40" : "focus:ring-2 focus:ring-[#00A651]/30"}`}
                autoFocus inputMode="numeric" />
              {/* Digit counter */}
              <div className={`absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-semibold transition-colors ${phoneDigitCount === 10 ? "text-[#00A651]" : "text-gray-400"}`}>
                {phoneDigitCount}/10
              </div>
            </div>
          </div>

          {msg.text && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-[13px] font-medium mb-3 animate-slide-down">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {msg.text}
            </div>
          )}

          {/* Next button */}
          <button onClick={() => {
            if (!phone) { setMsg({ text: "Please enter your phone number", type: "error" }); return; }
            if (phone.length !== 10) { setMsg({ text: "Phone number must be exactly 10 digits", type: "error" }); return; }
            if (!/^\d{10}$/.test(phone)) { setMsg({ text: "Phone number must contain only digits", type: "error" }); return; }
            setMsg({ text: "", type: "" });
            if (mode === "login") {
              setAuthStep("login-pin");
            } else {
              setAuthStep("reg-name");
            }
          }}
            className={`w-full py-4 rounded-2xl text-[16px] font-bold text-white border-none cursor-pointer transition-all duration-300 active:scale-[0.98] ${isPhoneValid ? "bg-[#00A651] hover:bg-[#008C46] shadow-[0_4px_15px_rgba(0,166,81,0.4)] scale-[1]" : "bg-[#D1EFE0] cursor-not-allowed opacity-70"}`}>
            NEXT
          </button>

          {/* Sign up / Sign in link */}
          <p className="text-center text-[14px] text-gray-500 mt-5">
            {mode === "login" ? (
              <>Don't have an account?{" "}
                <button onClick={() => { setMode("register"); setMsg({ text: "", type: "" }); }}
                  className="text-[#00A651] font-bold border-none bg-transparent cursor-pointer hover:underline text-[14px]">
                  Click here to Sign Up
                </button></>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => { setMode("login"); setMsg({ text: "", type: "" }); }}
                  className="text-[#00A651] font-bold border-none bg-transparent cursor-pointer hover:underline text-[14px]">
                  Sign In
                </button></>
            )}
          </p>
        </div>

        {/* Footer */}
        <div className="px-7 py-6 text-center">
          <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Licensed by the <span className="font-bold">CBN</span> and insured by the <span className="font-bold">NDIC</span>
          </p>
        </div>
      </div>
    );
  }

  /* ─── LOGIN: STEP 2 — 6‑DIGIT PIN ─── */
  if (authStep === "login-pin") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {renderHeader()}

        <div className="flex-1 flex flex-col px-7 pt-6">
          {/* Avatar & phone display */}
          <div className="flex flex-col items-center mb-8 animate-fade-up">
            <div className="w-[80px] h-[80px] rounded-full bg-[#D5F5E3] flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-[#00A651]" />
            </div>
            <p className="text-[16px] text-gray-500 font-medium tracking-wide">+234 {formattedPhone}</p>
          </div>

          {/* Heading */}
          <h1 className="text-[26px] font-[800] text-gray-900 mb-2 text-center animate-fade-up" style={{ animationDelay: "0.05s" }}>Welcome back!</h1>
          <p className="text-[14px] text-gray-500 text-center mb-7 animate-fade-up" style={{ animationDelay: "0.1s" }}>Enter your 6-digit PIN to log in</p>

          {/* Password/PIN input - 6 digits */}
          <div className="mb-4 animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <input type="password" placeholder="Enter 6-digit PIN" maxLength={6}
              value={password} onChange={(e) => setPassword(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-[#00A651]/40 rounded-2xl text-[16px] text-center tracking-[8px] text-gray-900 outline-none placeholder:text-gray-400 placeholder:tracking-normal placeholder:text-center focus:border-[#00A651] focus:ring-2 focus:ring-[#00A651]/20 transition-all"
              inputMode="numeric" autoComplete="one-time-code" autoFocus />
          </div>

          {msg.text && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-[13px] font-medium mb-4 animate-slide-down">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {msg.text}
            </div>
          )}

          {/* Forgot PIN */}
          <div className="text-right mb-8">
            <button className="text-[14px] font-semibold text-[#00A651] hover:underline bg-transparent border-none cursor-pointer">
              Forgot PIN?
            </button>
          </div>

          {/* Login button */}
          <button onClick={handleLogin} disabled={loading || password.length < 6}
            className={`w-full py-4 rounded-2xl text-[16px] font-bold text-white border-none transition-all duration-300 active:scale-[0.98] ${loading || password.length < 6 ? "bg-[#D1EFE0] cursor-not-allowed" : "bg-[#00A651] hover:bg-[#008C46] shadow-[0_4px_15px_rgba(0,166,81,0.3)] cursor-pointer"}`}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Logging in...
              </span>
            ) : "Log in"}
          </button>
        </div>

        {/* Secure Keypad label */}
        <div className="px-7 py-5 border-t border-gray-100">
          <p className="text-center text-[12px] text-gray-400 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#00A651]" />
            Walleo Secure Numeric Keypad
          </p>
        </div>
      </div>
    );
  }

  /* ─── REGISTER: STEP 2 — FULL NAME ─── */
  if (authStep === "reg-name") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {renderHeader()}

        <div className="flex-1 flex flex-col px-7 pt-6">
          {/* Avatar & phone display */}
          <div className="flex flex-col items-center mb-6 animate-fade-up">
            <div className="w-[80px] h-[80px] rounded-full bg-[#D5F5E3] flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-[#00A651]" />
            </div>
            <p className="text-[16px] text-gray-500 font-medium tracking-wide">+234 {formattedPhone}</p>
          </div>

          {/* Heading */}
          <h1 className="text-[26px] font-[800] text-gray-900 mb-2 text-center animate-fade-up" style={{ animationDelay: "0.05s" }}>What's your name?</h1>
          <p className="text-[14px] text-gray-500 text-center mb-7 animate-fade-up" style={{ animationDelay: "0.1s" }}>Enter your full legal name</p>

          {/* Name input */}
          <div className="mb-5 animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <input type="text" placeholder="Enter your full name" value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-[#00A651]/40 rounded-2xl text-[16px] text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#00A651] focus:ring-2 focus:ring-[#00A651]/20 transition-all"
              autoFocus />
          </div>

          {msg.text && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-[13px] font-medium mb-4 animate-slide-down">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {msg.text}
            </div>
          )}

          {/* Next button */}
          <button onClick={() => {
            if (!name.trim()) { setMsg({ text: "Please enter your full name", type: "error" }); return; }
            setMsg({ text: "", type: "" });
            setAuthStep("reg-pin");
          }}
            className={`w-full py-4 rounded-2xl text-[16px] font-bold text-white border-none cursor-pointer transition-all duration-300 active:scale-[0.98] ${name.trim() ? "bg-[#00A651] hover:bg-[#008C46] shadow-[0_4px_15px_rgba(0,166,81,0.3)]" : "bg-[#D1EFE0] cursor-not-allowed"}`}>
            NEXT
          </button>
        </div>

        {/* Footer */}
        <div className="px-7 py-6 text-center">
          <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Licensed by the <span className="font-bold">CBN</span> and insured by the <span className="font-bold">NDIC</span>
          </p>
        </div>
      </div>
    );
  }

  /* ─── REGISTER: STEP 3 — CREATE 6‑DIGIT PIN ─── */
  if (authStep === "reg-pin") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {renderHeader()}

        <div className="flex-1 flex flex-col px-7 pt-6">
          {/* Avatar & phone display */}
          <div className="flex flex-col items-center mb-6 animate-fade-up">
            <div className="w-[80px] h-[80px] rounded-full bg-[#D5F5E3] flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-[#00A651]" />
            </div>
            <p className="text-[16px] text-gray-500 font-medium tracking-wide">+234 {formattedPhone}</p>
          </div>

          {/* Heading */}
          <h1 className="text-[26px] font-[800] text-gray-900 mb-2 text-center animate-fade-up" style={{ animationDelay: "0.05s" }}>Create a PIN</h1>
          <p className="text-[14px] text-gray-500 text-center mb-7 animate-fade-up" style={{ animationDelay: "0.1s" }}>Your 6-digit secure login PIN</p>

          {/* PIN input */}
          <div className="mb-5 animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <input type="password" placeholder="Enter 6-digit PIN" maxLength={6}
              value={password} onChange={(e) => setPassword(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-[#00A651]/40 rounded-2xl text-[16px] text-center tracking-[8px] text-gray-900 outline-none placeholder:text-gray-400 placeholder:tracking-normal placeholder:text-center focus:border-[#00A651] focus:ring-2 focus:ring-[#00A651]/20 transition-all"
              inputMode="numeric" autoComplete="one-time-code" autoFocus />
          </div>

          {msg.text && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-[13px] font-medium mb-4 animate-slide-down">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {msg.text}
            </div>
          )}

          {/* Next button */}
          <button onClick={() => {
            if (password.length !== 6) { setMsg({ text: "PIN must be exactly 6 digits", type: "error" }); return; }
            setMsg({ text: "", type: "" });
            setAuthStep("reg-confirm-pin");
          }}
            className={`w-full py-4 rounded-2xl text-[16px] font-bold text-white border-none cursor-pointer transition-all duration-300 active:scale-[0.98] ${password.length === 6 ? "bg-[#00A651] hover:bg-[#008C46] shadow-[0_4px_15px_rgba(0,166,81,0.3)]" : "bg-[#D1EFE0] cursor-not-allowed"}`}>
            NEXT
          </button>
        </div>

        {/* Footer */}
        <div className="px-7 py-6 text-center">
          <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Licensed by the <span className="font-bold">CBN</span> and insured by the <span className="font-bold">NDIC</span>
          </p>
        </div>
      </div>
    );
  }

  /* ─── REGISTER: STEP 4 — CONFIRM 6‑DIGIT PIN ─── */
  if (authStep === "reg-confirm-pin") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {renderHeader()}

        <div className="flex-1 flex flex-col px-7 pt-6">
          {/* Avatar & phone display */}
          <div className="flex flex-col items-center mb-6 animate-fade-up">
            <div className="w-[80px] h-[80px] rounded-full bg-[#D5F5E3] flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-[#00A651]" />
            </div>
            <p className="text-[16px] text-gray-500 font-medium tracking-wide">+234 {formattedPhone}</p>
          </div>

          {/* Heading */}
          <h1 className="text-[26px] font-[800] text-gray-900 mb-2 text-center animate-fade-up" style={{ animationDelay: "0.05s" }}>Confirm your PIN</h1>
          <p className="text-[14px] text-gray-500 text-center mb-7 animate-fade-up" style={{ animationDelay: "0.1s" }}>Re-enter your 6-digit PIN to confirm</p>

          {/* Confirm PIN input */}
          <div className="mb-5 animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <input type="password" placeholder="Re-enter 6-digit PIN" maxLength={6}
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-[#00A651]/40 rounded-2xl text-[16px] text-center tracking-[8px] text-gray-900 outline-none placeholder:text-gray-400 placeholder:tracking-normal placeholder:text-center focus:border-[#00A651] focus:ring-2 focus:ring-[#00A651]/20 transition-all"
              inputMode="numeric" autoComplete="one-time-code" autoFocus />
          </div>

          {/* PIN match indicator */}
          {confirmPassword.length > 0 && (
            <div className="mb-4 animate-slide-down">
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${password === confirmPassword ? "bg-green-50" : "bg-red-50"}`}>
                  {password === confirmPassword
                    ? <Check className="w-3.5 h-3.5 text-[#00A651]" />
                    : <X className="w-3.5 h-3.5 text-red-500" />}
                </div>
                <span className={`text-[13px] font-medium ${password === confirmPassword ? "text-[#00A651]" : "text-red-500"}`}>
                  {password === confirmPassword ? "PINs match" : "PINs do not match"}
                </span>
              </div>
            </div>
          )}

          {msg.text && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-[13px] font-medium mb-4 animate-slide-down">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {msg.text}
            </div>
          )}

          {/* Create Account button */}
          <button onClick={handleRegister}
            disabled={loading || confirmPassword.length !== 6 || password !== confirmPassword}
            className={`w-full py-4 rounded-2xl text-[16px] font-bold text-white border-none transition-all duration-300 active:scale-[0.98] ${loading || confirmPassword.length !== 6 || password !== confirmPassword ? "bg-[#D1EFE0] cursor-not-allowed" : "bg-[#00A651] hover:bg-[#008C46] shadow-[0_4px_15px_rgba(0,166,81,0.3)] cursor-pointer"}`}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating account...
              </span>
            ) : "Create Account"}
          </button>
        </div>

        {/* Footer */}
        <div className="px-7 py-6 text-center">
          <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Licensed by the <span className="font-bold">CBN</span> and insured by the <span className="font-bold">NDIC</span>
          </p>
        </div>
      </div>
    );
  }

  return null;
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
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex items-center justify-between px-5 pt-4 pb-2 mb-2">
        <div />
        <span className="text-[15px] font-semibold text-[#00A651]">Help</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-7">
        <div className="w-[80px] h-[80px] rounded-full bg-[#D5F5E3] flex items-center justify-center mb-5">
          <Shield className="w-10 h-10 text-[#00A651]" />
        </div>
        <h1 className="text-[24px] font-[800] text-gray-900 mb-2 text-center">Create Transaction PIN</h1>
        <p className="text-[14px] text-gray-500 text-center mb-8">Set a 4-digit PIN to authorize transactions</p>
        <div className="flex gap-3.5 justify-center mb-8">
          {pin.map((v, i) => (
            <input key={i} id={`pin-${i}`} type="password" maxLength={1} value={v}
              onChange={(e) => handleChange(i, e.target.value)}
              className="w-14 h-16 text-center text-[24px] font-bold border-2 border-gray-200 rounded-2xl outline-none bg-gray-50 transition-all focus:border-[#00A651] focus:bg-white focus:ring-2 focus:ring-[#00A651]/20" />
          ))}
        </div>
        <button onClick={submit} disabled={loading}
          className="w-full py-4 rounded-2xl text-[16px] font-bold text-white border-none transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer"
          style={{ background: "linear-gradient(135deg, #A8E6C1, #00A651)" }}>
          {loading ? "Setting..." : "Set PIN"}
        </button>
        {msg && <p className="text-red-500 text-[13px] mt-4 text-center">{msg}</p>}
      </div>

      <div className="px-7 py-5 text-center">
        <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-[#00A651]" />
          Walleo Secure Numeric Keypad
        </p>
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
    localStorage.removeItem("userPhone");
    setToken("");
    setScreen("auth");
  };

  if (screen === "auth") return <AuthScreen onSuccess={handleAuth} />;
  if (screen === "pin") return <PinScreen onDone={() => setScreen("dash")} />;
  return <Dashboard token={token} userName={userName} onLogout={handleLogout} />;
}