import { auth } from "@/auth";
import { computePlan } from "@/lib/planner/engine";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const warehouseId = url.searchParams.get("warehouseId");
  if (!warehouseId) {
    return NextResponse.json(
      { error: "warehouseId query required" },
      { status: 400 },
    );
  }

  const wh = await prisma.plannerWarehouse.findFirst({
    where: { id: warehouseId, userId: session.user.id },
    include: { cargoLots: true },
  });
  if (!wh) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const plan = computePlan(
    {
      sqFt: wh.sqFt,
      floorStrengthPsf: wh.floorStrengthPsf,
      roofHeightFt: wh.roofHeightFt,
      loadFactor: wh.loadFactor,
      bufferPct: wh.bufferPct,
      clearanceUnderRoofFt: wh.clearanceUnderRoofFt,
    },
    wh.cargoLots.map((c) => ({
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

  return NextResponse.json({ plan, warehouse: { id: wh.id, name: wh.name } });
}
