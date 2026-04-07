import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Warehouse operator playbook | Warehouse Pro",
  description:
    "Practical levers for port-adjacent 3PL warehouses: utilization, dwell, reservations, spot cargo, and coordination with local port flows.",
};

export default function OperatorPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-foreground/10">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <Link
            href="/"
            className="text-sm font-medium text-accent hover:opacity-90"
          >
            ← Warehouse Pro
          </Link>
          <div className="flex flex-wrap gap-3 text-xs text-muted">
            <Link href="/present" className="text-accent hover:underline">
              Capability brief
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-14">
        <p className="text-sm font-medium text-accent">
          Port-adjacent 3PL · General cargo
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Optimize the warehouse from the ops floor
        </h1>
        <p className="mt-4 text-lg text-muted">
          If you run space for customers tied to{" "}
          <strong>local port</strong> discharge-rail-served sheds, trucking,
          drayage, commodity handling—the wins come from{" "}
          <strong>visible capacity</strong>, <strong>time-bound holds</strong>,
          and <strong>fast replanning</strong> when vessels or weather slip.
        </p>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-foreground">
            What to measure weekly
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted [&_strong]:font-semibold [&_strong]:text-foreground">
            <li>
              <strong>Utilization by zone</strong>—floor sq ft and (where it
              matters) cube, not a single blended number if indoor, outdoor, and
              rail tracks behave differently.
            </li>
            <li>
              <strong>Dwell</strong>—average and tail days in storage; long
              tails usually eat forecast accuracy and block new reservations.
            </li>
            <li>
              <strong>Forecast vs actual receipts</strong>—by customer or lane
              so sales and ops can tighten commitments.
            </li>
            <li>
              <strong>Spot share</strong>—how much space went to unplanned
              requests versus contract; too high means buffers are wrong or
              rules are unclear.
            </li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-foreground">
            Daily levers (operator checklist)
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted [&_strong]:font-semibold [&_strong]:text-foreground">
            <li>
              <strong>Morning snapshot:</strong> confirmed arrivals (rail, truck,
              port-related) versus <strong>reserved</strong> square footage by
              date range.
            </li>
            <li>
              <strong>Soft vs hard holds:</strong> know which blocks can move if
              a vessel is late or early; hard holds match SLAs and signed
              expectations.
            </li>
            <li>
              <strong>Spot gate:</strong> one queue, documented approver, and a
              rule for flex or overflow (e.g. only after buffer is confirmed
              empty).
            </li>
            <li>
              <strong>Weather and marine risk:</strong> when NWS marine zones
              flag high winds or seas, assume <strong>drayage and gate timing
              drift</strong>—shift soft reservations before you run out of
              options.
            </li>
            <li>
              <strong>WMS vs yard reality:</strong> reconcile exceptions
              (damaged labels, re-stacks) so planning numbers match what
              forklifts see.
            </li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-foreground">
            How this ties to the port (without magic APIs)
          </h2>
          <p className="mt-3 text-muted">
            The port side gives you <strong>timing pressure</strong> (when cargo
            is likely to hit the gate). Your WMS, customer EDI, and terminal or
            dray partners still own <strong>what</strong> and{" "}
            <strong>how much</strong>. Optimization is aligning those feeds to{" "}
            <strong>square feet and dates</strong>—the same units large
            regional 3PL networks publish at scale (for example, multi-facility
            operators in the Mobile market often describe millions of sq ft of
            warehouse space and full logistics stacks on their public sites).
          </p>
        </section>

        <section className="mt-12 rounded-xl border border-foreground/15 bg-foreground/[0.03] p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-foreground">
            Related pages
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted">
            <li>
              <Link href="/present" className="font-medium text-accent hover:underline">
                Capability brief for port-adjacent stakeholders
              </Link>
            </li>
            <li>
              Port authority contact channels
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
