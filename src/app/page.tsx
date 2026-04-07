import Link from "next/link";
import { BriefCallout } from "./components/brief-callout";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
        <BriefCallout />

        <p className="mt-10 text-sm font-medium text-accent">Warehouse Pro</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Your warehouse, organized.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted">
          Starter app for inventory, receiving, and fulfillment. Connect this
          project to your backend and workflows when you are ready.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
          >
            Sign in · Stowage planner
          </Link>
          <Link
            href="/present"
            className="inline-flex items-center justify-center rounded-lg border border-foreground/15 px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-foreground/5"
          >
            APA capability brief
          </Link>
          <Link
            href="https://github.com/CLGib/warehouse-pro"
            className="inline-flex items-center justify-center rounded-lg border border-foreground/15 px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-foreground/5"
          >
            View on GitHub
          </Link>
        </div>
        <p className="mt-6 text-sm text-muted">
          Run <code className="font-mono text-foreground">npm run dev</code> and
          use the URL shown in your terminal (often{" "}
          <code className="font-mono text-foreground">http://localhost:3000</code>
          ; if that port is busy, Next.js picks another, e.g.{" "}
          <code className="font-mono text-foreground">3001</code>). Hard-refresh
          the page (
          <kbd className="font-mono text-foreground">Cmd+Shift+R</kbd> /{" "}
          <kbd className="font-mono text-foreground">Ctrl+Shift+R</kbd>) if you
          still see an old screen. If dev fails, try{" "}
          <code className="font-mono text-foreground">npm run dev:webpack</code>
          . Then contact{" "}
          <a
            href="https://alports.com/contact/"
            className="text-accent underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Alabama Port Authority
          </a>
          .
        </p>
      </main>
    </div>
  );
}
