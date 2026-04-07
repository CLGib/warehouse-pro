import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
        <p className="text-sm font-medium text-accent">Warehouse Pro</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Planning your stow should take a few minutes.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted">
          Simple warehouse planning for teams that need fast, clear stow decisions.
        </p>
        <div className="mt-10">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
          >
            Create your free account
          </Link>
          <p className="mt-4 text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
