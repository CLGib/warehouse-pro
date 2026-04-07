import { auth } from "@/auth";
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
  });
  if (!wh) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const cargoLots = await prisma.plannerCargoLot.findMany({
    where: { warehouseId },
    orderBy: { startAt: "asc" },
  });

  return NextResponse.json({ cargoLots });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const warehouseId = String(body.warehouseId ?? "");
  const wh = await prisma.plannerWarehouse.findFirst({
    where: { id: warehouseId, userId: session.user.id },
  });
  if (!wh) {
    return NextResponse.json({ error: "Warehouse not found" }, { status: 404 });
  }

  const label = String(body.label ?? "Lot").trim() || "Lot";
  const sqFt = Number(body.sqFt);
  const weightLbs = Number(body.weightLbs);
  const stackHeightFt = Number(body.stackHeightFt);
  const priority = body.priority != null ? Number(body.priority) : 0;
  const startAt = new Date(String(body.startAt ?? ""));
  const endAt = new Date(String(body.endAt ?? ""));

  if (!Number.isFinite(sqFt) || sqFt <= 0) {
    return NextResponse.json({ error: "sqFt must be positive" }, { status: 400 });
  }
  if (!Number.isFinite(weightLbs) || weightLbs < 0) {
    return NextResponse.json({ error: "Invalid weightLbs" }, { status: 400 });
  }
  if (!Number.isFinite(stackHeightFt) || stackHeightFt <= 0) {
    return NextResponse.json(
      { error: "stackHeightFt must be positive" },
      { status: 400 },
    );
  }
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return NextResponse.json({ error: "Invalid dates" }, { status: 400 });
  }
  if (endAt.getTime() <= startAt.getTime()) {
    return NextResponse.json(
      { error: "endAt must be after startAt" },
      { status: 400 },
    );
  }

  const lot = await prisma.plannerCargoLot.create({
    data: {
      warehouseId,
      label,
      sqFt,
      weightLbs,
      stackHeightFt,
      startAt,
      endAt,
      priority,
    },
  });

  return NextResponse.json({ cargoLot: lot });
}
