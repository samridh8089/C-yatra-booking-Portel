"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { CyatraLogo } from "@/components/CyatraLogo";

interface LoginFormProps {
  mode: "owner" | "admin";
}

export function LoginForm({ mode }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const isOwner = mode === "owner";
  const title = isOwner ? "Owner Login" : "Admin Login";
  const subtitle = isOwner
    ? "Access your C-Yatra travel portal dashboard"
    : "Manage travel categories and booking portals.";
  const noticeTitle = "Private Access";
  const noticeSubtitle = isOwner
    ? "This portal is only for C-Yatra owner"
    : "This portal is only for authorized administrators";
  const redirectTo = isOwner ? "/dashboard" : "/admin/portals";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          requiredRole: mode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid email or password");
      }

      // Success: redirect to destination
      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Authentication failed");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center font-sans overflow-hidden bg-slate-900">
      {/* Scenic Udaipur Lake Palace Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/images/udaipur-lake-palace.jpg')`,
        }}
      />

      {/* Atmospheric overlay matching the reference */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />

      {/* Main Content Layout (Split layout on desktop, centered on mobile) */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Side: Brand & Hero Message (Desktop) */}
        <div className="hidden lg:flex flex-col max-w-lg text-white">
          <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl w-fit shadow-lg mb-8">
            <CyatraLogo className="h-14 w-auto" width={220} height={110} priority />
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight drop-shadow-md">
            All Your <br />
            Travel Portals <br />
            <span className="text-red-500 drop-shadow-sm">in One Place</span>
          </h1>

          <p className="mt-4 text-base xl:text-lg text-slate-100/90 font-medium drop-shadow">
            Quick access to the best booking websites for your travel business.
          </p>

          {/* C-Yatra tricolor accent line */}
          <div className="mt-5 flex items-center gap-1.5">
            <div className="h-1.5 w-10 rounded-full bg-cyatra-red" />
            <div className="h-1.5 w-7 rounded-full bg-cyatra-green" />
          </div>
        </div>

        {/* Right Side / Mobile Center: Floating Login Card */}
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-9 animate-in fade-in zoom-in-95 duration-200">
          {/* C-Yatra Logo on top of form */}
          <div className="flex justify-center mb-5">
            <CyatraLogo className="h-12 sm:h-14 w-auto" width={180} height={90} priority />
          </div>

          {/* Title and Subtitle */}
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {subtitle}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyatra-red/20 focus:border-cyatra-red transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyatra-red/20 focus:border-cyatra-red transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-cyatra-red hover:bg-cyatra-redHover text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Private Access Notice */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-slate-700" />
              <span>{noticeTitle}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {noticeSubtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
