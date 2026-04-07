"use client";

type Zone = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  utilization: number;
};

type Door = {
  id: string;
  label: string;
  side: "top" | "right" | "bottom" | "left";
  offset: number;
  isOpen: boolean;
};

type Placement = {
  cargoId: string;
  label: string;
  zoneId: string;
  sqFt: number;
  kind: "bagged" | "palletized" | "breakbulk" | "loose";
};

type Props = {
  warehouseName: string;
  doorOpenRatio: number;
  totalSqFt: number;
  occupiedSqFt: number;
  zones: Zone[];
  doors: Door[];
  placements: Placement[];
  intervalLabel: string;
};

function utilizationColor(value: number) {
  if (value >= 0.85) return "fill-red-500/40 stroke-red-400";
  if (value >= 0.6) return "fill-amber-400/40 stroke-amber-300";
  return "fill-emerald-500/35 stroke-emerald-300";
}

function doorCoords(
  side: Door["side"],
  offset: number,
  viewWidth: number,
  viewHeight: number,
) {
  const doorLength = 16;
  const o = Math.max(0.05, Math.min(0.95, offset));
  if (side === "top") {
    const x = o * viewWidth;
    return { x1: x - doorLength / 2, y1: 0, x2: x + doorLength / 2, y2: 0 };
  }
  if (side === "bottom") {
    const x = o * viewWidth;
    return {
      x1: x - doorLength / 2,
      y1: viewHeight,
      x2: x + doorLength / 2,
      y2: viewHeight,
    };
  }
  if (side === "left") {
    const y = o * viewHeight;
    return { x1: 0, y1: y - doorLength / 2, x2: 0, y2: y + doorLength / 2 };
  }
  const y = o * viewHeight;
  return {
    x1: viewWidth,
    y1: y - doorLength / 2,
    x2: viewWidth,
    y2: y + doorLength / 2,
  };
}

export function WarehouseVisualization({
  warehouseName,
  doorOpenRatio,
  totalSqFt,
  occupiedSqFt,
  zones,
  doors,
  placements,
  intervalLabel,
}: Props) {
  const occupancy = totalSqFt > 0 ? occupiedSqFt / totalSqFt : 0;
  const viewWidth = 100;
  const viewHeight = 62;

  return (
    <section className="mt-12">
      <h2 className="text-lg font-semibold text-foreground">Floor visualization</h2>
      <p className="mt-2 text-sm text-muted">
        {warehouseName} map for general cargo with doors, zone utilization, and
        live occupancy estimates.
      </p>
      <p className="mt-1 text-xs text-muted">Interval: {intervalLabel}</p>

      <div className="mt-4 rounded-xl border border-foreground/15 bg-foreground/[0.02] p-4">
        <div className="mb-4 flex flex-wrap gap-3 text-xs">
          <span className="rounded-md border border-emerald-300/40 bg-emerald-500/20 px-2 py-1 text-foreground">
            Low use
          </span>
          <span className="rounded-md border border-amber-300/40 bg-amber-500/20 px-2 py-1 text-foreground">
            Medium use
          </span>
          <span className="rounded-md border border-red-300/40 bg-red-500/20 px-2 py-1 text-foreground">
            Near capacity
          </span>
          <span className="rounded-md border border-sky-300/40 bg-sky-500/20 px-2 py-1 text-foreground">
            Door open
          </span>
        </div>

        <svg
          viewBox={`0 0 ${viewWidth} ${viewHeight}`}
          className="w-full rounded-lg bg-background"
          role="img"
          aria-label="Warehouse floor map"
        >
          <rect
            x={1}
            y={1}
            width={viewWidth - 2}
            height={viewHeight - 2}
            className="fill-transparent stroke-foreground/40"
            strokeWidth={1.5}
          />

          {zones.map((zone) => (
            <g key={zone.id}>
              <rect
                x={zone.x}
                y={zone.y}
                width={zone.width}
                height={zone.height}
                className={`${utilizationColor(zone.utilization)}`}
                strokeWidth={0.75}
                rx={1.2}
              />
              <text
                x={zone.x + 1.5}
                y={zone.y + 3}
                className="fill-foreground text-[2.8px]"
              >
                {zone.label}
              </text>
            </g>
          ))}

          {doors.map((door) => {
            const c = doorCoords(door.side, door.offset, viewWidth, viewHeight);
            return (
              <g key={door.id}>
                <line
                  x1={c.x1}
                  y1={c.y1}
                  x2={c.x2}
                  y2={c.y2}
                  className={
                    door.isOpen ? "stroke-sky-400" : "stroke-foreground/40"
                  }
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </g>
            );
          })}
        </svg>

        <div className="mt-4 grid gap-2 text-sm text-muted sm:grid-cols-3">
          <div className="rounded-lg border border-foreground/10 p-3">
            Occupancy: {(occupancy * 100).toFixed(0)}%
          </div>
          <div className="rounded-lg border border-foreground/10 p-3">
            Doors open: {(doorOpenRatio * 100).toFixed(0)}%
          </div>
          <div className="rounded-lg border border-foreground/10 p-3">
            Used area: {occupiedSqFt.toFixed(0)} / {totalSqFt.toFixed(0)} sq ft
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-foreground/10 p-3">
          <p className="text-xs font-medium text-foreground">Stow placements</p>
          {placements.length > 0 ? (
            <ul className="mt-2 space-y-1 text-xs text-muted">
              {placements.map((p) => (
                <li key={`${p.cargoId}-${p.zoneId}`}>
                  {p.label} ({p.kind}): {p.sqFt.toFixed(0)} sq ft in{" "}
                  <span className="text-foreground">{p.zoneId}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-muted">
              No active cargo in this interval.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
