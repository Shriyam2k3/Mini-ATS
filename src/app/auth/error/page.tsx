import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const error = searchParams.error || "AuthenticationFailed";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-xl">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Authentication Error</h1>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          {error === "Configuration"
            ? "Server authentication configuration issue. Ensure OAuth client ID and secrets are properly configured in .env.local."
            : error === "AccessDenied"
            ? "Access was denied by the identity provider or account authorization rules."
            : "An unexpected error occurred during the sign-in procedure. Please check your credentials and try again."}
        </p>

        <div className="mt-6 flex justify-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
