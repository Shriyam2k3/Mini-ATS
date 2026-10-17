"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validators";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { SocialLoginButtons } from "./SocialLoginButtons";

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const authError = searchParams.get("error");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    authError ? "Authentication failed. Please check your credentials." : null
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
        callbackUrl,
      });

      if (!result?.ok) {
        setErrorMessage(
          result?.error || "Invalid email or password. Please try again."
        );
        toast.error("Sign-in failed. Please verify your credentials.");
      } else {
        toast.success("Welcome back! Redirecting to ATS dashboard...");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setErrorMessage("An unexpected authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemoRecruiter = () => {
    setValue("email", "recruiter@earlyjobs.ai");
    setValue("password", "Recruiter123!");
    toast.info("Demo recruiter credentials filled!");
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-black text-xl mb-3 shadow-md shadow-emerald-800/20">
          EJ
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Welcome to Mini ATS
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          EarlyJobs.ai Applicant Tracking System Portal
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {errorMessage}
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
            Or sign in with email
          </span>
        </div>
      </div>

      {/* Email / Password Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Email Address
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
            Password
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
          <span>{isLoading ? "Signing In..." : "Sign In to Workspace"}</span>
        </button>

        {/* Quick Demo Credentials Button */}
        <button
          type="button"
          onClick={handleFillDemoRecruiter}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium rounded-xl border border-slate-200 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          Fill Demo Recruiter Credentials
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500">
        New recruiter?{" "}
        <Link
          href="/register"
          className="font-semibold text-emerald-800 hover:text-emerald-950 underline underline-offset-2"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
