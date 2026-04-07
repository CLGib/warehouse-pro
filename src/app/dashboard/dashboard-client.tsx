"use client";

import type { PlanResult } from "@/lib/planner/engine";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { WarehouseVisualization } from "./warehouse-visualization";

type Warehouse = {
  id: string;
  name: string;
  sqFt: number;
  floorStrengthPsf: number;
  roofHeightFt: number;
  loadFactor: number;
  bufferPct: number;
  clearanceUnderRoofFt: number;
  doorLayout?: unknown;
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

type CargoKind = "bagged" | "palletized" | "breakbulk" | "loose";
type DoorSide = "top" | "right" | "bottom" | "left";
type DoorLayout = { id: string; label: string; side: DoorSide; offset: number };
const DEFAULT_DOOR_LAYOUT: DoorLayout[] = [
  { id: "door-1", label: "Dock 1", side: "top", offset: 0.14 },
  { id: "door-2", label: "Dock 2", side: "top", offset: 0.36 },
  { id: "door-3", label: "Dock 3", side: "right", offset: 0.4 },
  { id: "door-4", label: "Personnel", side: "bottom", offset: 0.8 },
];

function isDoorLayout(value: unknown): value is DoorLayout[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (d) =>
      !!d &&
      typeof d === "object" &&
      typeof (d as { id?: unknown }).id === "string" &&
      typeof (d as { label?: unknown }).label === "string" &&
      (d as { side?: unknown }).side !== undefined &&
      ["top", "right", "bottom", "left"].includes(
        String((d as { side?: unknown }).side),
      ) &&
      typeof (d as { offset?: unknown }).offset === "number",
  );
}

type Props = {
  initialWarehouses: Warehouse[];
  initialSelectedId: string | null;
  initialCargo: CargoLot[];
  initialPlan: PlanResult | null;
};

function detectCargoKind(label: string): CargoKind {
  const l = label.toLowerCase();
  if (l.includes("bag") || l.includes("sack") || l.includes("grain")) {
    return "bagged";
  }
  if (l.includes("pallet") || l.includes("skid")) {
    return "palletized";
  }
  if (l.includes("crate") || l.includes("drum") || l.includes("bundle")) {
    return "breakbulk";
  }
  return "loose";
}

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
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const initialSelectedWarehouse = initialWarehouses.find(
    (w) => w.id === initialSelectedId,
  );
  const [doorLayout, setDoorLayout] = useState<DoorLayout[]>(
    isDoorLayout(initialSelectedWarehouse?.doorLayout)
      ? (initialSelectedWarehouse.doorLayout as DoorLayout[])
      : DEFAULT_DOOR_LAYOUT,
  );

  const selected = warehouses.find((w) => w.id === selectedId) ?? null;
  const estimatedOccupiedSqFt = cargo.reduce((sum, lot) => sum + lot.sqFt, 0);
  const zones = useMemo(
    () => [
      {
        id: "Receiving",
        label: "Receiving",
        x: 5,
        y: 5,
        width: 22,
        height: 18,
        utilization: Math.min(
          1,
          estimatedOccupiedSqFt / Math.max(1, (selected?.sqFt ?? 1) * 0.28),
        ),
      },
      {
        id: "Rack A",
        label: "Rack A",
        x: 31,
        y: 5,
        width: 20,
        height: 24,
        utilization: Math.min(
          1,
          estimatedOccupiedSqFt / Math.max(1, (selected?.sqFt ?? 1) * 0.32),
        ),
      },
      {
        id: "Rack B",
        label: "Rack B",
        x: 54,
        y: 5,
        width: 20,
        height: 24,
        utilization: Math.min(
          1,
          estimatedOccupiedSqFt / Math.max(1, (selected?.sqFt ?? 1) * 0.35),
        ),
      },
      {
        id: "Staging",
        label: "Staging",
        x: 77,
        y: 5,
        width: 18,
        height: 18,
        utilization: Math.min(
          1,
          estimatedOccupiedSqFt / Math.max(1, (selected?.sqFt ?? 1) * 0.25),
        ),
      },
      {
        id: "Bag Stacks",
        label: "Bag Stacks",
        x: 5,
        y: 28,
        width: 22,
        height: 28,
        utilization: Math.min(
          1,
          estimatedOccupiedSqFt / Math.max(1, (selected?.sqFt ?? 1) * 0.3),
        ),
      },
      {
        id: "Packout",
        label: "Packout",
        x: 31,
        y: 34,
        width: 28,
        height: 22,
        utilization: Math.min(
          1,
          estimatedOccupiedSqFt / Math.max(1, (selected?.sqFt ?? 1) * 0.22),
        ),
      },
      {
        id: "Returns",
        label: "Returns",
        x: 63,
        y: 34,
        width: 22,
        height: 22,
        utilization: Math.min(
          1,
          estimatedOccupiedSqFt / Math.max(1, (selected?.sqFt ?? 1) * 0.2),
        ),
      },
    ],
    [estimatedOccupiedSqFt, selected?.sqFt],
  );
  const doors = doorLayout.map((d) => ({
    ...d,
    isOpen:
      d.id === "door-1"
        ? !!plan && !plan.summary.anyHeightIssue
        : d.id === "door-2"
          ? cargo.length % 2 === 0
          : d.id === "door-3"
            ? cargo.length > 0
            : !!selected && selected._count?.cargoLots !== 0,
  }));
  const openDoors = doors.filter((d) => d.isOpen).length;
  const doorOpenRatio = doors.length > 0 ? openDoors / doors.length : 0;
  const segments = plan?.segments ?? [];
  const clampedSegmentIndex =
    segments.length > 0 ? Math.min(segmentIndex, segments.length - 1) : 0;
  const activeSegment = segments[clampedSegmentIndex] ?? null;
  const activeCargo = useMemo(() => {
    if (!activeSegment) return [];
    return cargo.filter((c) => activeSegment.activeIds.includes(c.id));
  }, [activeSegment, cargo]);

  const intervalLabel = activeSegment
    ? `${new Date(activeSegment.start).toLocaleString()} -> ${new Date(activeSegment.end).toLocaleString()}`
    : "No interval selected";

  const placements = useMemo(() => {
    if (!activeCargo.length) return [];
    const zoneCapacities = zones.map((z) => ({
      id: z.id,
      label: z.label,
      remaining: (selected?.sqFt ?? 0) * (z.width * z.height) / 6200,
    }));
    const prioritized = [...activeCargo].sort((a, b) => b.priority - a.priority);
    const result: Array<{
      cargoId: string;
      label: string;
      zoneId: string;
      sqFt: number;
      kind: CargoKind;
    }> = [];

    const preferredZones: Record<CargoKind, string[]> = {
      bagged: ["Bag Stacks", "Staging", "Returns"],
      palletized: ["Rack A", "Rack B", "Staging"],
      breakbulk: ["Receiving", "Staging", "Packout"],
      loose: ["Staging", "Returns", "Receiving"],
    };

    for (const lot of prioritized) {
      const kind = detectCargoKind(lot.label);
      let remaining = lot.sqFt;
      const ordered = [
        ...preferredZones[kind]
          .map((id) => zoneCapacities.find((z) => z.id === id))
          .filter((z): z is (typeof zoneCapacities)[number] => !!z),
        ...zoneCapacities.filter((z) => !preferredZones[kind].includes(z.id)),
      ];

      for (const zone of ordered) {
        if (remaining <= 0) break;
        if (zone.remaining <= 0) continue;
        const allocated = Math.min(remaining, zone.remaining);
        if (allocated > 0) {
          result.push({
            cargoId: lot.id,
            label: lot.label,
            zoneId: zone.id,
            sqFt: allocated,
            kind,
          });
          zone.remaining -= allocated;
          remaining -= allocated;
        }
      }
    }
    return result;
  }, [activeCargo, zones, selected?.sqFt]);

  useEffect(() => {
    if (!isPlaying || segments.length <= 1) return;
    const timer = setInterval(() => {
      setSegmentIndex((prev) => (prev + 1) % segments.length);
    }, 1500);
    return () => clearInterval(timer);
  }, [isPlaying, segments.length]);

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
      const warehouse = warehouses.find((w) => w.id === id);
      if (isDoorLayout(warehouse?.doorLayout)) {
        setDoorLayout(warehouse.doorLayout);
      } else {
        setDoorLayout(DEFAULT_DOOR_LAYOUT);
      }
      setError(null);
      try {
        await Promise.all([loadCargo(id), loadPlan(id)]);
      } catch {
        setError("Could not load cargo or plan for that warehouse.");
      }
    },
    [loadCargo, loadPlan, warehouses],
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
    try {
      const fd = new FormData(e.currentTarget);
      const startDate = String(fd.get("startDate") ?? "").trim();
      const startTime = String(fd.get("startTime") ?? "").trim();
      const endDate = String(fd.get("endDate") ?? "").trim();
      const endTime = String(fd.get("endTime") ?? "").trim();
      if (!startDate || !startTime || !endDate || !endTime) {
        setError("Please enter a complete start/end date and time.");
        return;
      }

      const body = {
        warehouseId: selectedId,
        label: fd.get("label"),
        sqFt: Number(fd.get("sqFt")),
        weightLbs: Number(fd.get("weightLbs")),
        stackHeightFt: Number(fd.get("stackHeightFt")),
        priority: Number(fd.get("priority")),
        startAt: `${startDate}T${startTime}`,
        endAt: `${endDate}T${endTime}`,
      };
      const res = await fetch("/api/cargo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(payload?.error ?? `Could not add cargo (HTTP ${res.status}).`);
        return;
      }
      e.currentTarget.reset();
      await refreshAll();
    } catch {
      setError("Could not add cargo. Check connection and try again.");
    }
  }

  async function removeCargo(id: string) {
    const res = await fetch(`/api/cargo/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Could not remove cargo.");
      return;
    }
    await refreshAll();
  }

  async function persistDoorLayout(next: DoorLayout[]) {
    if (!selected) return;
    const res = await fetch(`/api/warehouse/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doorLayout: next }),
    });
    if (!res.ok) {
      setError("Could not save door layout.");
      return;
    }
    const data = await res.json();
    setWarehouses((prev) =>
      prev.map((w) => (w.id === selected.id ? { ...w, ...data.warehouse } : w)),
    );
  }

  const toLocalInput = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const [defaultCargoTimes] = useState(() => {
    const nowMs = Date.now();
    return {
      nowLocal: toLocalInput(new Date(nowMs).toISOString()),
      plusOneDayLocal: toLocalInput(
        new Date(nowMs + 24 * 60 * 60 * 1000).toISOString(),
      ),
    };
  });

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
                name="startDate"
                type="date"
                defaultValue={defaultCargoTimes.nowLocal.slice(0, 10)}
                required
                className="rounded-lg border border-foreground/20 bg-background px-3 py-2"
              />
              <input
                name="startTime"
                type="time"
                defaultValue={defaultCargoTimes.nowLocal.slice(11, 16)}
                required
                className="rounded-lg border border-foreground/20 bg-background px-3 py-2"
              />
              <input
                name="endDate"
                type="date"
                defaultValue={defaultCargoTimes.plusOneDayLocal.slice(0, 10)}
                required
                className="rounded-lg border border-foreground/20 bg-background px-3 py-2"
              />
              <input
                name="endTime"
                type="time"
                defaultValue={defaultCargoTimes.plusOneDayLocal.slice(11, 16)}
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

        {selected ? (
          <section className="mt-8 rounded-xl border border-foreground/10 p-4">
            <h3 className="text-sm font-semibold text-foreground">Door layout</h3>
            <p className="mt-1 text-xs text-muted">
              Move doors on each wall with side and position controls.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {doorLayout.map((door) => (
                <div
                  key={door.id}
                  className="rounded-lg border border-foreground/10 p-3"
                >
                  <p className="text-xs font-medium text-foreground">{door.label}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <label className="text-xs text-muted" htmlFor={`${door.id}-side`}>
                      Side
                    </label>
                    <select
                      id={`${door.id}-side`}
                      value={door.side}
                      onChange={(e) =>
                        {
                          const next = doorLayout.map((d) =>
                            d.id === door.id
                              ? {
                                  ...d,
                                  side: e.currentTarget.value as DoorSide,
                                }
                              : d,
                          );
                          setDoorLayout(next);
                          void persistDoorLayout(next);
                        }
                      }
                      className="rounded-md border border-foreground/20 bg-background px-2 py-1 text-xs"
                    >
                      <option value="top">Top</option>
                      <option value="right">Right</option>
                      <option value="bottom">Bottom</option>
                      <option value="left">Left</option>
                    </select>
                  </div>
                  <div className="mt-3">
                    <label
                      className="mb-1 block text-xs text-muted"
                      htmlFor={`${door.id}-offset`}
                    >
                      Position: {(door.offset * 100).toFixed(0)}%
                    </label>
                    <input
                      id={`${door.id}-offset`}
                      type="range"
                      min={0.05}
                      max={0.95}
                      step={0.01}
                      value={door.offset}
                      onChange={(e) =>
                        {
                          const raw = Number(e.currentTarget.value);
                          const clamped = Math.max(0.05, Math.min(0.95, raw));
                          const next = doorLayout.map((d) =>
                            d.id === door.id ? { ...d, offset: clamped } : d,
                          );
                          setDoorLayout(next);
                          void persistDoorLayout(next);
                        }
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {selected ? (
          <WarehouseVisualization
            warehouseName={selected.name}
            totalSqFt={selected.sqFt}
            occupiedSqFt={activeSegment?.totals.sqFt ?? estimatedOccupiedSqFt}
            doorOpenRatio={doorOpenRatio}
            zones={zones}
            doors={doors}
            placements={placements}
            intervalLabel={intervalLabel}
          />
        ) : null}

        {selected && segments.length > 0 ? (
          <section className="mt-6 pb-16">
            <h3 className="text-sm font-semibold text-foreground">
              Build sequence playback
            </h3>
            <p className="mt-1 text-xs text-muted">
              Step through intervals to visualize general-cargo stow as it builds
              (including bagged and breakbulk cargo).
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="rounded-lg border border-foreground/20 px-3 py-1.5 text-xs font-medium hover:bg-foreground/5"
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
              <input
                type="range"
                min={0}
                max={Math.max(0, segments.length - 1)}
                value={clampedSegmentIndex}
                onChange={(e) => setSegmentIndex(Number(e.currentTarget.value))}
                className="w-full max-w-xl"
              />
              <span className="text-xs text-muted">
                Interval {clampedSegmentIndex + 1} / {segments.length}
              </span>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
