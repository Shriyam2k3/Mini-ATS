import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { Suspense } from "react";
import { LoadingState } from "@/components/common/LoadingState";

export default async function LoginPage() {
  const session = await auth();

  if (session && session.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Suspense fallback={<LoadingState fullPage message="Loading sign-in..." />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
