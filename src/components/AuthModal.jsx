import React, { useState } from "react";
import {
  Lock,
  Mail,
  Key,
  ShieldCheck,
  Sparkles,
  AlertCircle,
} from "lucide-react";

 const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const AuthModal = ({ isOpen, onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleFillDemo = () => {
    setEmail("demo@citeflow.ai");
    setPassword("citeflow123");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("citeflow_token", data.token);
        localStorage.setItem("citeflow_user", JSON.stringify(data.user));
        onLoginSuccess(data.user);
      } else {
        setError(data.error || "Authentication failed");
      }
    } catch (err) {
      setError("Cannot connect to backend server on port 5000");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-3 shadow-lg shadow-sky-600/20">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Access CiteFlow Studio
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sign in to unlock interactive AI document intelligence and
            citations.
          </p>
        </div>

        {/* Demo Credentials Quick-Fill Banner */}
        <div className="mb-5 p-3 rounded-xl bg-sky-950/40 border border-sky-800/60 flex items-center justify-between">
          <div className="text-[11px] text-sky-300">
            <span className="font-semibold block text-slate-200">
              Test Credentials:
            </span>
            <span>demo@citeflow.ai / citeflow123</span>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-xs bg-sky-600 hover:bg-sky-500 text-white font-medium px-2.5 py-1.5 rounded-lg transition-all active:scale-95 flex items-center gap-1 shadow-sm"
          >
            <Sparkles className="w-3 h-3" />
            <span>Auto Fill</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs py-3 rounded-xl transition-all shadow-lg shadow-sky-600/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isLoading ? "Verifying..." : "Sign In to Workspace"}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
