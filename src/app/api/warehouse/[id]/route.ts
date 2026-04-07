import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const existing = await prisma.plannerWarehouse.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data: Record<string, number | string> = {};
  if (body.name != null) data.name = String(body.name).trim();
  if (body.sqFt != null) {
    const v = Number(body.sqFt);
    if (!Number.isFinite(v) || v <= 0) {
      return NextResponse.json({ error: "Invalid sqFt" }, { status: 400 });
    }
    data.sqFt = v;
  }
  if (body.floorStrengthPsf != null) {
    const v = Number(body.floorStrengthPsf);
    if (!Number.isFinite(v) || v <= 0) {
      return NextResponse.json(
        { error: "Invalid floorStrengthPsf" },
        { status: 400 },
      );
    }
    data.floorStrengthPsf = v;
  }
  if (body.roofHeightFt != null) {
    const v = Number(body.roofHeightFt);
    if (!Number.isFinite(v) || v <= 0) {
      return NextResponse.json(
        { error: "Invalid roofHeightFt" },
        { status: 400 },
      );
    }
    data.roofHeightFt = v;
  }
  if (body.loadFactor != null) data.loadFactor = Number(body.loadFactor);
  if (body.bufferPct != null) data.bufferPct = Number(body.bufferPct);
  if (body.clearanceUnderRoofFt != null) {
    data.clearanceUnderRoofFt = Number(body.clearanceUnderRoofFt);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ warehouse: existing });
  }

  const warehouse = await prisma.plannerWarehouse.update({
    where: { id },
    data,
  });

  return NextResponse.json({ warehouse });
}
