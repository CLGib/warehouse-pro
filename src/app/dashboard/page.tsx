import { auth } from "@/auth";
import { computePlan } from "@/lib/planner/engine";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { listWarehousesWithCounts } from "@/lib/supabase/warehouses";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const warehouses = await listWarehousesWithCounts(session.user.id);

  const selectedId = warehouses[0]?.id ?? null;

  let initialCargo: Array<{
    id: string;
    label: string;
    sqFt: number;
    weightLbs: number;
    stackHeightFt: number;
    startAt: string;
    endAt: string;
    priority: number;
  }> = [];

  let initialPlan: ReturnType<typeof computePlan> | null = null;

  if (selectedId) {
    const wh = warehouses.find((w) => w.id === selectedId);
    const supabase = getSupabaseAdmin();
    const { data: lots, error } = await supabase
      .from("PlannerCargoLot")
      .select("*")
      .eq("warehouseId", selectedId)
      .order("startAt", { ascending: true });

    if (error) {
      console.error("dashboard cargo load:", error);
    }

    const lotRows = lots ?? [];

    initialCargo = lotRows.map((c) => ({
      id: c.id as string,
      label: c.label as string,
      sqFt: c.sqFt as number,
      weightLbs: c.weightLbs as number,
      stackHeightFt: c.stackHeightFt as number,
      startAt: new Date(c.startAt as string).toISOString(),
      endAt: new Date(c.endAt as string).toISOString(),
      priority: c.priority as number,
    }));

    if (wh) {
      initialPlan = computePlan(
        {
          sqFt: wh.sqFt,
          floorStrengthPsf: wh.floorStrengthPsf,
          roofHeightFt: wh.roofHeightFt,
          loadFactor: wh.loadFactor,
          bufferPct: wh.bufferPct,
          clearanceUnderRoofFt: wh.clearanceUnderRoofFt,
        },
        lotRows.map((c) => ({
          id: c.id as string,
          label: c.label as string,
          sqFt: c.sqFt as number,
          weightLbs: c.weightLbs as number,
          stackHeightFt: c.stackHeightFt as number,
          startAt: new Date(c.startAt as string),
          endAt: new Date(c.endAt as string),
          priority: c.priority as number,
        })),
      );
    }
  }

  const whJson = JSON.parse(JSON.stringify(warehouses)) as typeof warehouses;

  return (
    <DashboardClient
      initialWarehouses={whJson}
      initialSelectedId={selectedId}
      initialCargo={initialCargo}
      initialPlan={initialPlan}
    />
  );
}
