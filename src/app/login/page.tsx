import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto w-full max-w-md">
        <p className="text-sm font-medium text-accent">Warehouse Pro</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Sign in or create your free account
        </h1>
        <p className="mt-2 text-sm text-muted">
          Plan general-cargo floor use from slab capacity, clear height, and
          cargo timing. Any demo person can create an account here in seconds.
        </p>
        <div className="mt-8 rounded-xl border border-foreground/15 bg-foreground/[0.02] p-6">
          <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/" className="text-accent hover:underline">
            ← Back home
          </Link>
        </p>
      </div>
    </div>
  );
}
