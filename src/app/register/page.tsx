import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Suspense } from "react";
import { LoadingState } from "@/components/common/LoadingState";

export default async function RegisterPage() {
  const session = await auth();

  if (session && session.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Suspense fallback={<LoadingState fullPage message="Loading registration..." />}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
