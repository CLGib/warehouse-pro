export type ViolationKind = "AREA" | "WEIGHT" | "HEIGHT";

export type PlannerCargoInput = {
  id: string;
  label: string;
  sqFt: number;
  weightLbs: number;
  stackHeightFt: number;
  startAt: Date;
  endAt: Date;
  priority: number;
};

export type PlannerWarehouseInput = {
  sqFt: number;
  floorStrengthPsf: number;
  roofHeightFt: number;
  loadFactor: number;
  bufferPct: number;
  clearanceUnderRoofFt: number;
};

export type PlanSegment = {
  start: string;
  end: string;
  activeIds: string[];
  totals: {
    sqFt: number;
    weightLbs: number;
    maxStackFt: number;
  };
  limits: {
    usableSqFt: number;
    maxWeightLbs: number;
    effectiveRoofFt: number;
  };
  violations: ViolationKind[];
  ok: boolean;
};

export type PlanResult = {
  generatedAt: string;
  segments: PlanSegment[];
  summary: {
    worstAreaUtilization: number;
    worstWeightUtilization: number;
    anyHeightIssue: boolean;
    hasViolations: boolean;
  };
  suggestions: string[];
};

function overlaps(a0: Date, a1: Date, b0: Date, b1: Date): boolean {
  return a0.getTime() < b1.getTime() && a1.getTime() > b0.getTime();
}

function uniqueSortedTimes(cargo: PlannerCargoInput[]): number[] {
  const s = new Set<number>();
  for (const c of cargo) {
    s.add(c.startAt.getTime());
    s.add(c.endAt.getTime());
  }
  return [...s].sort((x, y) => x - y);
}

export function computePlan(
  warehouse: PlannerWarehouseInput,
  cargo: PlannerCargoInput[],
): PlanResult {
  const usableSqFt = warehouse.sqFt * (1 - Math.min(0.95, Math.max(0, warehouse.bufferPct)));
  const maxWeightLbs =
    warehouse.sqFt * warehouse.floorStrengthPsf * Math.min(1, Math.max(0.1, warehouse.loadFactor));
  const effectiveRoofFt = Math.max(
    0,
    warehouse.roofHeightFt - Math.max(0, warehouse.clearanceUnderRoofFt),
  );

  const generatedAt = new Date().toISOString();

  if (cargo.length === 0) {
    return {
      generatedAt,
      segments: [],
      summary: {
        worstAreaUtilization: 0,
        worstWeightUtilization: 0,
        anyHeightIssue: false,
        hasViolations: false,
      },
      suggestions: [
        "No cargo in the plan yet. Add lots with start/end times to see interval-by-interval utilization.",
      ],
    };
  }

  const times = uniqueSortedTimes(cargo);
  const segments: PlanSegment[] = [];
  let worstAreaUtilization = 0;
  let worstWeightUtilization = 0;
  let anyHeightIssue = false;

  for (let i = 0; i < times.length - 1; i++) {
    const t0 = times[i];
    const t1 = times[i + 1];
    if (t1 <= t0) continue;

    const d0 = new Date(t0);
    const d1 = new Date(t1);
    const active = cargo.filter((c) => overlaps(c.startAt, c.endAt, d0, d1));
    if (active.length === 0) continue;

    const totalSqFt = active.reduce((s, c) => s + c.sqFt, 0);
    const totalWeight = active.reduce((s, c) => s + c.weightLbs, 0);
    const maxStackFt = active.reduce((m, c) => Math.max(m, c.stackHeightFt), 0);

    const violations: ViolationKind[] = [];
    if (totalSqFt > usableSqFt) violations.push("AREA");
    if (totalWeight > maxWeightLbs) violations.push("WEIGHT");
    if (maxStackFt > effectiveRoofFt) violations.push("HEIGHT");

    if (maxStackFt > effectiveRoofFt) anyHeightIssue = true;
    worstAreaUtilization = Math.max(worstAreaUtilization, totalSqFt / usableSqFt);
    worstWeightUtilization = Math.max(
      worstWeightUtilization,
      maxWeightLbs > 0 ? totalWeight / maxWeightLbs : 0,
    );

    segments.push({
      start: d0.toISOString(),
      end: d1.toISOString(),
      activeIds: active.map((c) => c.id),
      totals: {
        sqFt: totalSqFt,
        weightLbs: totalWeight,
        maxStackFt: maxStackFt,
      },
      limits: {
        usableSqFt,
        maxWeightLbs,
        effectiveRoofFt,
      },
      violations,
      ok: violations.length === 0,
    });
  }

  const badSegments = segments.filter((s) => !s.ok);
  const suggestions: string[] = [];

  if (badSegments.length === 0) {
    suggestions.push(
      "All modeled time intervals stay within usable floor area, slab load (with your load factor), and clear height.",
    );
    if (worstAreaUtilization > 0.85) {
      suggestions.push(
        `Peak floor use reaches about ${(worstAreaUtilization * 100).toFixed(0)}% of usable sq ft — keep buffer for re-handling and spot cargo.`,
      );
    }
  } else {
    for (const seg of badSegments.slice(0, 5)) {
      const labels = cargo
        .filter((c) => seg.activeIds.includes(c.id))
        .map((c) => c.label)
        .join(", ");
      if (seg.violations.includes("AREA")) {
        suggestions.push(
          `Between ${seg.start} and ${seg.end}: floor demand (${seg.totals.sqFt.toFixed(0)} sq ft) exceeds usable ${seg.limits.usableSqFt.toFixed(0)} sq ft. Active: ${labels}.`,
        );
      }
      if (seg.violations.includes("WEIGHT")) {
        suggestions.push(
          `Between ${seg.start} and ${seg.end}: weight ${seg.totals.weightLbs.toFixed(0)} lb exceeds modeled limit ${seg.limits.maxWeightLbs.toFixed(0)} lb. Active: ${labels}.`,
        );
      }
      if (seg.violations.includes("HEIGHT")) {
        suggestions.push(
          `Between ${seg.start} and ${seg.end}: required stack height ${seg.totals.maxStackFt.toFixed(1)} ft exceeds effective clear ${seg.limits.effectiveRoofFt.toFixed(1)} ft. Active: ${labels}.`,
        );
      }
    }

    const byPriority = [...cargo].sort((a, b) => a.priority - b.priority);
    const deferCandidates = byPriority.slice(0, 3).map((c) => c.label);
    if (deferCandidates.length) {
      suggestions.push(
        `Deferral candidates (lowest priority first — review before committing): ${deferCandidates.join(", ")}.`,
      );
    }
  }

  return {
    generatedAt,
    segments,
    summary: {
      worstAreaUtilization,
      worstWeightUtilization,
      anyHeightIssue,
      hasViolations: badSegments.length > 0,
    },
    suggestions,
  };
}
