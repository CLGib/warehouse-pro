import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Warehouse Pro · Stowage and capacity planning",
  description:
    "Plan warehouse space in minutes: floor load, clear height, cargo lots with time windows, and zone-level reservations for general cargo near the port.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-foreground/10">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <span className="text-sm font-semibold text-foreground">
            Warehouse Pro
          </span>
          <nav className="flex flex-wrap items-center gap-4 text-sm text-muted">
            <Link href="/present" className="hover:text-foreground">
              Capability brief
            </Link>
            <Link href="/operator" className="hover:text-foreground">
              Operator playbook
            </Link>
            <Link
              href="/login"
              className="font-medium text-accent hover:underline"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-20 pt-12 sm:pt-16">
        <p className="text-sm font-medium text-accent">General cargo · Port-adjacent</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Planning your stow should take a few minutes.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Simple warehouse planning for teams that need fast, clear stow
          decisions—driven by floor space, cube, weight, and time windows, not
          container counts alone.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
          >
            Create your free account
          </Link>
          <Link
            href="/present"
            className="text-sm font-medium text-accent hover:underline"
          >
            Read the capability brief →
          </Link>
        </div>

        <section className="mt-16 border-t border-foreground/10 pt-16">
          <h2 className="text-lg font-semibold text-foreground">Who it&apos;s for</h2>
          <p className="mt-3 text-base leading-relaxed text-muted [&_strong]:font-semibold [&_strong]:text-foreground">
            Port and terminal partners, 3PLs, and warehouse operators managing{" "}
            <strong>general cargo</strong>—metals, forest products, project
            cargo, bulk, autos, and similar—where utilization is driven by{" "}
            <strong>square feet, cube, weight, and lift units</strong>. If your
            world is sheds, yards, and rail-served space tied to local discharge,
            this lens fits better than TEU-only tools.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-lg font-semibold text-foreground">
            The operational gap we close
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted [&_strong]:font-semibold [&_strong]:text-foreground">
            <li>
              <strong>Predictable flow</strong> from contracts and recurring
              lanes deserves <strong>reserved capacity</strong> so space
              isn&apos;t double-booked.
            </li>
            <li>
              <strong>Schedules slip</strong>—weather, berth changes, and vessel
              ETAs move when pressure hits the gate. You need a plan you can
              refresh, not a static spreadsheet.
            </li>
            <li>
              <strong>Spot and opportunistic cargo</strong> needs clear rules:
              flex space or capacity that yields only when your policy allows—not
              endless phone tags.
            </li>
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="text-lg font-semibold text-foreground">
            What you get in the product
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted [&_strong]:font-semibold [&_strong]:text-foreground">
            <li>
              <strong>Stowage planner:</strong> model square footage, floor
              strength (psf), clear height, and cargo lots with start and end
              times. See an interval-by-interval view of area, weight against a
              slab-style limit, and stacking versus roof height—so decisions stay
              visible and comparable.
            </li>
            <li>
              <strong>Capacity thinking by zone:</strong> indoor, outdoor, and
              bonded-style zones with buffers; time-bound reservations (hard and
              soft holds); forecasts and spot requests that respect your rules.
            </li>
            <li>
              <strong>Room to grow:</strong> start with visibility and
              reservation discipline; add automation and external signals when
              integrations and trust mature—without pretending one feed replaces
              your WMS or terminal systems of record.
            </li>
          </ul>
        </section>

        <section className="mt-14 rounded-xl border border-foreground/15 bg-foreground/[0.03] p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-foreground">
            Data you can stand behind
          </h2>
          <p className="mt-3 text-muted">
            <strong className="text-foreground">Authoritative</strong> for space
            allocation stays with your bookings, TMS or terminal schedules,
            contracts, and yard or WMS truth.{" "}
            <strong className="text-foreground">Supportive signals</strong>—like
            vessel ETAs or marine weather—help answer when surge risk rises; they
            don&apos;t replace manifest or stowage detail from operational
            partners.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-lg font-semibold text-foreground">
            Run better from the floor
          </h2>
          <p className="mt-3 text-muted">
            Weekly metrics and daily operator habits—utilization by zone, dwell,
            forecast versus actual receipts, spot share—are summarized in our{" "}
            <Link href="/operator" className="font-medium text-accent hover:underline">
              operator playbook
            </Link>
            . Use it alongside the app to keep sales, ops, and commercial aligned.
          </p>
        </section>

        <section className="mt-14 rounded-xl border border-foreground/10 bg-foreground/[0.02] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Important limitations
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
            <li>
              Warehouse Pro is a <strong className="text-foreground">planning aid</strong>, not structural
              engineering. Floor and roof inputs are yours to validate; nothing
              here certifies building safety.
            </li>
            <li>
              This is <strong className="text-foreground">not official port authority software</strong>.
              Formal port inquiries and day-of channel or security information
              belong on official channels.
            </li>
          </ul>
        </section>

        <section className="mt-16 border-t border-foreground/10 pt-12 text-center">
          <p className="text-lg font-medium text-foreground">
            Ready to plan stow in minutes?
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
            >
              Create your free account
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-muted hover:text-foreground"
            >
              Sign in
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-foreground/10 py-8">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-6 text-xs text-muted">
          <span>© {new Date().getFullYear()} Warehouse Pro</span>
          <div className="flex flex-wrap gap-4">
            <Link href="/present" className="hover:text-foreground">
              Capability brief
            </Link>
            <Link href="/operator" className="hover:text-foreground">
              Operator playbook
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
