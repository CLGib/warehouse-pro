import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
        <p className="text-sm font-medium text-accent">Warehouse Pro</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Your warehouse, organized.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted">
          Starter app for inventory, receiving, and fulfillment. Connect this
          project to your backend and workflows when you are ready.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="https://github.com/CLGib/warehouse-pro"
            className="inline-flex items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
          >
            View on GitHub
          </Link>
          <span className="inline-flex items-center rounded-lg border border-foreground/15 px-5 py-2.5 text-sm text-muted">
            Run <code className="font-mono text-foreground">npm run dev</code>{" "}
            to start
          </span>
        </div>
      </main>
    </div>
  );
}
