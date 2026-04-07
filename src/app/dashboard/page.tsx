import { auth } from "@/auth";
import { computePlan } from "@/lib/planner/engine";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const warehouses = await prisma.plannerWarehouse.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { cargoLots: true } } },
  });

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
    const lots = await prisma.plannerCargoLot.findMany({
      where: { warehouseId: selectedId },
      orderBy: { startAt: "asc" },
    });

    initialCargo = lots.map((c) => ({
      id: c.id,
      label: c.label,
      sqFt: c.sqFt,
      weightLbs: c.weightLbs,
      stackHeightFt: c.stackHeightFt,
      startAt: c.startAt.toISOString(),
      endAt: c.endAt.toISOString(),
      priority: c.priority,
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
        lots.map((c) => ({
          id: c.id,
          label: c.label,
          sqFt: c.sqFt,
          weightLbs: c.weightLbs,
          stackHeightFt: c.stackHeightFt,
          startAt: c.startAt,
          endAt: c.endAt,
          priority: c.priority,
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
