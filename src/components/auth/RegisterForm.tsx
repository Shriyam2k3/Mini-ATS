"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validators";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { SocialLoginButtons } from "./SocialLoginButtons";

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      toast.success("Account created successfully! You can now log in.");
      router.push("/login");
    } catch (err: any) {
      setServerError(err.message || "An unexpected error occurred.");
      toast.error(err.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-black text-xl mb-3 shadow-md shadow-emerald-800/20">
          EJ
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Create ATS Account
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Join EarlyJobs.ai recruitment team as a verified Recruiter
        </p>
      </div>

      {serverError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {serverError}
        </div>
      )}

      {/* Social OAuth Sign In */}
      <SocialLoginButtons />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">
            Or register with credentials
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="e.g. John Doe"
              {...register("name")}
              className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all"
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Work Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </span>
            <input
              type="email"
              placeholder="recruiter@earlyjobs.ai"
              {...register("email")}
              className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Password (Min 6 characters)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </span>
            <input
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all"
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>
          )}
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
          <span>
            New accounts receive the standard <strong>RECRUITER</strong> role with full access to candidate pipeline and metrics.
          </span>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-800/15 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-1 disabled:opacity-60"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
          <span>{isLoading ? "Creating Account..." : "Register as Recruiter"}</span>
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-emerald-800 hover:text-emerald-950 underline underline-offset-2"
        >
          Sign in here
        </Link>
      </div>
    </div>
  );
}
