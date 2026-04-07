import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "General cargo warehouse optimization | Warehouse Pro",
  description:
    "Capability brief: planning warehouse utilization for general cargo at port-scale operations, with room for predictable flow, weather-driven changes, and spot shipments.",
};

const sections = [
  {
    title: "Who this is for",
    body: (
      <>
        Port and terminal partners managing{" "}
        <strong>general cargo</strong>—metals, forest products, project cargo,
        bulk, autos, and similar—where utilization is driven by{" "}
        <strong>floor space, cube, weight, and lift units</strong>, not
        container (TEU) counts. The Port of Mobile and Alabama Port Authority
        ecosystem is a natural fit for this lens.
      </>
    ),
  },
  {
    title: "The operational problem",
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Predictable flow</strong> from contracts and recurring lanes
          deserves <strong>reserved capacity</strong> so sheds and yards are
          not double-booked.
        </li>
        <li>
          <strong>Shipping does not stay on schedule</strong>—weather, berth
          changes, and vessel ETAs shift when pressure hits the gate.
        </li>
        <li>
          <strong>Spot and opportunistic cargo</strong> needs clear rules:
          flex space, or capacity that can yield only when policy allows.
        </li>
      </ul>
    ),
  },
  {
    title: "What better optimization looks like",
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>
          A <strong>capacity ledger</strong> by zone (indoor, outdoor, bonded
          where relevant) with agreed buffers for uncertainty.
        </li>
        <li>
          <strong>Time-bound reservations</strong>—hard vs soft holds,
          priority tiers—aligned to commercial SLAs and ops reality.
        </li>
        <li>
          <strong>Fast replanning</strong> when external signals change (marine
          weather, significant ETA movement), plus a path for manual overrides
          from supervisors.
        </li>
        <li>
          A <strong>spot queue</strong> that only consumes unreserved or
          preemptible capacity under your rules—not ad hoc phone tags.
        </li>
      </ul>
    ),
  },
  {
    title: "Data: what is authoritative vs supportive",
    body: (
      <>
        <p className="mb-3">
          <strong>Authoritative for space allocation:</strong> your bookings,
          TMS or terminal schedules, contracts, WMS/yard truth, and importer or
          forwarder forecasts—whatever Mobile actually runs on day to day.
        </p>
        <p>
          <strong>Supportive signals (not a substitute for cargo detail):</strong>{" "}
          vessel ETAs and port events (commercial AIS-style APIs, often keyed by
          UN/LOCODE <code className="rounded bg-foreground/10 px-1.5 py-0.5 font-mono text-sm">USMOB</code>
          ), and public marine weather and alerts (e.g. NOAA NWS). These help
          answer <em>when</em> surge risk rises; they do not replace stowage or
          manifest detail from operational partners.
        </p>
      </>
    ),
  },
  {
    title: "How we can help Alabama Port Authority stakeholders",
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>
          Translate this into a <strong>practical planning model</strong> and,
          when you are ready, software hooks (APIs and data rules) that respect
          APA and tenant systems of record.
        </li>
        <li>
          Keep the conversation grounded in <strong>general cargo</strong>{" "}
          metrics your teams already use—square feet, cube, tons, pallets,
          pieces—not container-centric assumptions.
        </li>
        <li>
          Support <strong>incremental rollout</strong>: start with visibility
          and reservation discipline, then add automation and external feeds as
          trust and integrations mature.
        </li>
      </ul>
    ),
  },
];

export default function PresentPage() {
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
            <span>Capability brief · General cargo</span>
            <Link href="/operator" className="text-accent hover:underline">
              Operator playbook
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-14">
        <p className="text-sm font-medium text-accent">
          Port of Mobile · Alabama Port Authority alignment
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Warehouse utilization for general cargo
        </h1>
        <p className="mt-4 text-lg text-muted">
          A concise picture of how disciplined capacity planning—reservations,
          replanning, and spot rules—can support APA and tenant operations
          without pretending one public API replaces your operational data.
        </p>

        <div className="mt-12 space-y-12">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-lg font-semibold text-foreground">
                {s.title}
              </h2>
              <div className="mt-3 text-base leading-relaxed text-muted [&_strong]:font-semibold [&_strong]:text-foreground">
                {s.body}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-14 rounded-xl border border-foreground/15 bg-foreground/[0.03] p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-foreground">
            Suggested next step with APA
          </h2>
          <p className="mt-2 text-muted">
            Use the official{" "}
            <a
              href="https://alports.com/contact/"
              className="font-medium text-accent underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Alabama Port Authority contact page
            </a>{" "}
            to route your inquiry (headquarters: 250 N. Water Street, Mobile).
            Offer a short meeting to walk this brief and map it to specific
            sheds, tenants, and data owners—warehousing, terminal partners, and
            commercial teams.
          </p>
          <p className="mt-4 text-sm text-muted">
            Operational hotlines and port information (channel conditions,
            security) are listed on{" "}
            <a
              href="https://alports.com/contact/"
              className="text-accent underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              alports.com/contact
            </a>
            ; use those channels for day-of port operations, not for this
            planning proposal unless directed.
          </p>
        </section>
      </main>
    </div>
  );
}
