import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const warehouses = await prisma.plannerWarehouse.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { cargoLots: true } } },
  });

  return NextResponse.json({ warehouses });
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

  const name = String(body.name ?? "My warehouse").trim() || "My warehouse";
  const sqFt = Number(body.sqFt);
  const floorStrengthPsf = Number(body.floorStrengthPsf);
  const roofHeightFt = Number(body.roofHeightFt);
  const loadFactor = body.loadFactor != null ? Number(body.loadFactor) : 0.8;
  const bufferPct = body.bufferPct != null ? Number(body.bufferPct) : 0.1;
  const clearanceUnderRoofFt =
    body.clearanceUnderRoofFt != null
      ? Number(body.clearanceUnderRoofFt)
      : 2;

  if (!Number.isFinite(sqFt) || sqFt <= 0) {
    return NextResponse.json({ error: "sqFt must be positive" }, { status: 400 });
  }
  if (!Number.isFinite(floorStrengthPsf) || floorStrengthPsf <= 0) {
    return NextResponse.json(
      { error: "floorStrengthPsf must be positive" },
      { status: 400 },
    );
  }
  if (!Number.isFinite(roofHeightFt) || roofHeightFt <= 0) {
    return NextResponse.json(
      { error: "roofHeightFt must be positive" },
      { status: 400 },
    );
  }

  const w = await prisma.plannerWarehouse.create({
    data: {
      userId: session.user.id,
      name,
      sqFt,
      floorStrengthPsf,
      roofHeightFt,
      loadFactor,
      bufferPct,
      clearanceUnderRoofFt,
    },
  });

  return NextResponse.json({ warehouse: w });
}
