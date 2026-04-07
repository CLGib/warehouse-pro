"use client";

import type { PlanResult } from "@/lib/planner/engine";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useCallback, useState } from "react";

type Warehouse = {
  id: string;
  name: string;
  sqFt: number;
  floorStrengthPsf: number;
  roofHeightFt: number;
  loadFactor: number;
  bufferPct: number;
  clearanceUnderRoofFt: number;
  _count?: { cargoLots: number };
};

type CargoLot = {
  id: string;
  label: string;
  sqFt: number;
  weightLbs: number;
  stackHeightFt: number;
  startAt: string;
  endAt: string;
  priority: number;
};

type Props = {
  initialWarehouses: Warehouse[];
  initialSelectedId: string | null;
  initialCargo: CargoLot[];
  initialPlan: PlanResult | null;
};

export function DashboardClient({
  initialWarehouses,
  initialSelectedId,
  initialCargo,
  initialPlan,
}: Props) {
  const { data: session } = useSession();
  const [warehouses, setWarehouses] = useState(initialWarehouses);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const [cargo, setCargo] = useState(initialCargo);
  const [plan, setPlan] = useState<PlanResult | null>(initialPlan);
  const [error, setError] = useState<string | null>(null);

  const selected = warehouses.find((w) => w.id === selectedId) ?? null;

  const loadCargo = useCallback(async (warehouseId: string) => {
    const res = await fetch(`/api/cargo?warehouseId=${warehouseId}`);
    if (!res.ok) throw new Error("cargo");
    const data = await res.json();
    setCargo(data.cargoLots ?? []);
  }, []);

  const loadPlan = useCallback(async (warehouseId: string) => {
    const res = await fetch(`/api/plan?warehouseId=${warehouseId}`);
    if (!res.ok) throw new Error("plan");
    const data = await res.json();
    setPlan(data.plan);
  }, []);

  const selectWarehouse = useCallback(
    async (id: string) => {
      setSelectedId(id);
      setError(null);
      try {
        await Promise.all([loadCargo(id), loadPlan(id)]);
      } catch {
        setError("Could not load cargo or plan for that warehouse.");
      }
    },
    [loadCargo, loadPlan],
  );

  const refreshAll = useCallback(async () => {
    if (!selectedId) return;
    setError(null);
    try {
      await Promise.all([loadCargo(selectedId), loadPlan(selectedId)]);
    } catch {
      setError("Refresh failed.");
    }
  }, [selectedId, loadCargo, loadPlan]);

  async function saveWarehouse(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get("name"),
      sqFt: Number(fd.get("sqFt")),
      floorStrengthPsf: Number(fd.get("floorStrengthPsf")),
      roofHeightFt: Number(fd.get("roofHeightFt")),
      loadFactor: Number(fd.get("loadFactor")),
      bufferPct: Number(fd.get("bufferPct")),
      clearanceUnderRoofFt: Number(fd.get("clearanceUnderRoofFt")),
    };
    const res = await fetch(`/api/warehouse/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setError("Could not save warehouse.");
      return;
    }
    const data = await res.json();
    setWarehouses((prev) =>
      prev.map((w) => (w.id === selected.id ? { ...w, ...data.warehouse } : w)),
    );
    await refreshAll();
  }

  async function createWarehouse(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get("name"),
      sqFt: Number(fd.get("sqFt")),
      floorStrengthPsf: Number(fd.get("floorStrengthPsf")),
      roofHeightFt: Number(fd.get("roofHeightFt")),
    };
    const res = await fetch("/api/warehouse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setError("Could not create warehouse.");
      return;
    }
    const data = await res.json();
    const w = {
      ...(data.warehouse as Warehouse),
      _count: { cargoLots: 0 },
    };
    setWarehouses((prev) => [w, ...prev]);
    await selectWarehouse(w.id);
    e.currentTarget.reset();
  }

  async function addCargo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedId) return;
    const fd = new FormData(e.currentTarget);
    const body = {
      warehouseId: selectedId,
      label: fd.get("label"),
      sqFt: Number(fd.get("sqFt")),
      weightLbs: Number(fd.get("weightLbs")),
      stackHeightFt: Number(fd.get("stackHeightFt")),
      priority: Number(fd.get("priority")),
      startAt: fd.get("startAt"),
      endAt: fd.get("endAt"),
    };
    const res = await fetch("/api/cargo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setError("Could not add cargo.");
      return;
    }
    e.currentTarget.reset();
    await refreshAll();
  }

  async function removeCargo(id: string) {
    const res = await fetch(`/api/cargo/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Could not remove cargo.");
      return;
    }
    await refreshAll();
  }

  const toLocalInput = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-foreground/10 pb-6">
          <div>
            <p className="text-sm font-medium text-accent">Stowage planner</p>
            <h1 className="text-2xl font-semibold text-foreground">
              Real-time cargo plan
            </h1>
            <p className="mt-1 text-sm text-muted">{session?.user?.email}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => refreshAll()}
              className="rounded-lg border border-foreground/20 px-4 py-2 text-sm font-medium text-foreground hover:bg-foreground/5"
            >
              Refresh plan
            </button>
            <Link
              href="/"
              className="rounded-lg border border-foreground/20 px-4 py-2 text-sm font-medium text-foreground hover:bg-foreground/5"
            >
              Home
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Sign out
            </button>
          </div>
        </header>

        <div className="mt-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-foreground">
          <strong className="font-semibold">Disclaimer:</strong> Slab (psf) and
          clear height are <em>your inputs</em> for planning only. This tool
          does not replace structural engineering, fire codes, or rack
          certifications.
        </div>

        {error ? (
          <p className="mt-4 text-sm font-medium text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">Warehouse</h2>
          {warehouses.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {warehouses.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => void selectWarehouse(w.id)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    w.id === selectedId
                      ? "border-accent bg-accent/15 text-foreground"
                      : "border-foreground/15 text-muted hover:bg-foreground/5"
                  }`}
                >
                  {w.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">
              No warehouse yet — create one below.
            </p>
          )}

          {selected ? (
            <form
              onSubmit={saveWarehouse}
              className="mt-6 grid gap-4 sm:grid-cols-2"
            >
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Name
                </label>
                <input
                  name="name"
                  key={selected.id + "name"}
                  defaultValue={selected.name}
                  className="mt-1 w-full rounded-lg border border-foreground/20 bg-background px-3 py-2 text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Floor area (sq ft)
                </label>
                <input
                  name="sqFt"
                  type="number"
                  step="1"
                  min="1"
                  required
                  key={selected.id + "sqFt"}
                  defaultValue={selected.sqFt}
                  className="mt-1 w-full rounded-lg border border-foreground/20 bg-background px-3 py-2 text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Floor strength (psf)
                </label>
                <input
                  name="floorStrengthPsf"
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  key={selected.id + "psf"}
                  defaultValue={selected.floorStrengthPsf}
                  className="mt-1 w-full rounded-lg border border-foreground/20 bg-background px-3 py-2 text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Roof / clear height (ft)
                </label>
                <input
                  name="roofHeightFt"
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  key={selected.id + "roof"}
                  defaultValue={selected.roofHeightFt}
                  className="mt-1 w-full rounded-lg border border-foreground/20 bg-background px-3 py-2 text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Load factor (0–1)
                </label>
                <input
                  name="loadFactor"
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="1"
                  key={selected.id + "lf"}
                  defaultValue={selected.loadFactor}
                  className="mt-1 w-full rounded-lg border border-foreground/20 bg-background px-3 py-2 text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Aisle / handling buffer (0–1)
                </label>
                <input
                  name="bufferPct"
                  type="number"
                  step="0.01"
                  min="0"
                  max="0.95"
                  key={selected.id + "buf"}
                  defaultValue={selected.bufferPct}
                  className="mt-1 w-full rounded-lg border border-foreground/20 bg-background px-3 py-2 text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Clearance under roof (ft)
                </label>
                <input
                  name="clearanceUnderRoofFt"
                  type="number"
                  step="0.1"
                  min="0"
                  key={selected.id + "clr"}
                  defaultValue={selected.clearanceUnderRoofFt}
                  className="mt-1 w-full rounded-lg border border-foreground/20 bg-background px-3 py-2 text-foreground"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  Save building inputs
                </button>
              </div>
            </form>
          ) : null}

          <div className="mt-10 rounded-xl border border-foreground/15 p-5">
            <h3 className="text-sm font-semibold text-foreground">
              New warehouse
            </h3>
            <form
              onSubmit={createWarehouse}
              className="mt-4 grid gap-3 sm:grid-cols-2"
            >
              <input
                name="name"
                placeholder="Name"
                required
                className="rounded-lg border border-foreground/20 bg-background px-3 py-2 text-foreground sm:col-span-2"
              />
              <input
                name="sqFt"
                type="number"
                placeholder="Sq ft"
                min="1"
                required
                className="rounded-lg border border-foreground/20 bg-background px-3 py-2 text-foreground"
              />
              <input
                name="floorStrengthPsf"
                type="number"
                placeholder="Floor psf"
                min="0.1"
                step="0.1"
                required
                className="rounded-lg border border-foreground/20 bg-background px-3 py-2 text-foreground"
              />
              <input
                name="roofHeightFt"
                type="number"
                placeholder="Clear height (ft)"
                min="0.1"
                step="0.1"
                required
                className="rounded-lg border border-foreground/20 bg-background px-3 py-2 text-foreground sm:col-span-2"
              />
              <button
                type="submit"
                className="rounded-lg border border-foreground/20 px-4 py-2 text-sm font-medium hover:bg-foreground/5 sm:col-span-2"
              >
                Create warehouse
              </button>
            </form>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-foreground">
            Cargo lots & timing
          </h2>
          {selectedId ? (
            <form
              onSubmit={addCargo}
              className="mt-4 grid gap-3 rounded-xl border border-foreground/15 p-5 sm:grid-cols-2"
            >
              <input
                name="label"
                placeholder="Label / customer"
                required
                className="rounded-lg border border-foreground/20 bg-background px-3 py-2 sm:col-span-2"
              />
              <input
                name="sqFt"
                type="number"
                placeholder="Sq ft"
                min="1"
                required
                className="rounded-lg border border-foreground/20 bg-background px-3 py-2"
              />
              <input
                name="weightLbs"
                type="number"
                placeholder="Weight (lb)"
                min="0"
                step="1"
                required
                className="rounded-lg border border-foreground/20 bg-background px-3 py-2"
              />
              <input
                name="stackHeightFt"
                type="number"
                placeholder="Stack height (ft)"
                min="0.1"
                step="0.1"
                required
                className="rounded-lg border border-foreground/20 bg-background px-3 py-2"
              />
              <input
                name="priority"
                type="number"
                placeholder="Priority (higher = keep)"
                defaultValue={0}
                className="rounded-lg border border-foreground/20 bg-background px-3 py-2"
              />
              <input
                name="startAt"
                type="datetime-local"
                required
                className="rounded-lg border border-foreground/20 bg-background px-3 py-2"
              />
              <input
                name="endAt"
                type="datetime-local"
                required
                className="rounded-lg border border-foreground/20 bg-background px-3 py-2"
              />
              <button
                type="submit"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white sm:col-span-2"
              >
                Add cargo lot
              </button>
            </form>
          ) : null}

          <ul className="mt-6 space-y-3">
            {cargo.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-foreground/10 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-foreground">{c.label}</p>
                  <p className="text-muted">
                    {c.sqFt} sq ft · {c.weightLbs.toLocaleString()} lb · stack{" "}
                    {c.stackHeightFt} ft · priority {c.priority}
                  </p>
                  <p className="text-xs text-muted">
                    {toLocalInput(c.startAt)} → {toLocalInput(c.endAt)} (local)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void removeCargo(c.id)}
                  className="text-sm text-red-600 hover:underline dark:text-red-400"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 pb-20">
          <h2 className="text-lg font-semibold text-foreground">
            Live plan output
          </h2>
          {plan ? (
            <>
              <p className="mt-2 text-sm text-muted">
                Generated {new Date(plan.generatedAt).toLocaleString()} · Peak
                floor use ~{(plan.summary.worstAreaUtilization * 100).toFixed(0)}
                % of usable sq ft · Peak load ~{(plan.summary.worstWeightUtilization * 100).toFixed(0)}% of modeled weight cap
                {plan.summary.anyHeightIssue
                  ? " · Clear height violations in some intervals"
                  : ""}
              </p>
              <ul className="mt-4 space-y-2">
                {plan.suggestions.map((s, i) => (
                  <li
                    key={`suggestion-${i}`}
                    className="rounded-lg border border-foreground/10 bg-foreground/[0.02] px-4 py-3 text-sm text-muted"
                  >
                    {s}
                  </li>
                ))}
              </ul>
              <div className="mt-8 overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-foreground/15">
                      <th className="py-2 pr-4 font-medium text-foreground">
                        Interval start
                      </th>
                      <th className="py-2 pr-4 font-medium text-foreground">
                        End
                      </th>
                      <th className="py-2 pr-4 font-medium text-foreground">
                        Sq ft
                      </th>
                      <th className="py-2 pr-4 font-medium text-foreground">
                        Weight (lb)
                      </th>
                      <th className="py-2 pr-4 font-medium text-foreground">
                        Max stack
                      </th>
                      <th className="py-2 font-medium text-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.segments.map((seg, i) => (
                      <tr
                        key={`seg-${i}-${seg.start}`}
                        className="border-b border-foreground/10 text-muted"
                      >
                        <td className="py-2 pr-4 font-mono text-xs">
                          {new Date(seg.start).toLocaleString()}
                        </td>
                        <td className="py-2 pr-4 font-mono text-xs">
                          {new Date(seg.end).toLocaleString()}
                        </td>
                        <td className="py-2 pr-4">
                          {seg.totals.sqFt.toFixed(0)} /{" "}
                          {seg.limits.usableSqFt.toFixed(0)}
                        </td>
                        <td className="py-2 pr-4">
                          {seg.totals.weightLbs.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}{" "}
                          / {seg.limits.maxWeightLbs.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td className="py-2 pr-4">
                          {seg.totals.maxStackFt.toFixed(1)} /{" "}
                          {seg.limits.effectiveRoofFt.toFixed(1)} ft
                        </td>
                        <td className="py-2">
                          {seg.ok ? (
                            <span className="text-green-600 dark:text-green-400">
                              OK
                            </span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400">
                              {seg.violations.join(", ")}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted">No plan data.</p>
          )}
        </section>
      </div>
    </div>
  );
}
