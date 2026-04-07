import { auth } from "@/auth";
import { newRowId, getSupabaseAdmin } from "@/lib/supabase/admin";
import { listWarehousesWithCounts } from "@/lib/supabase/warehouses";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const warehouses = await listWarehousesWithCounts(session.user.id);
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

  const supabase = getSupabaseAdmin();
  const id = newRowId();
  const now = new Date().toISOString();

  const { data: w, error } = await supabase
    .from("PlannerWarehouse")
    .insert({
      id,
      userId: session.user.id,
      name,
      sqFt,
      floorStrengthPsf,
      roofHeightFt,
      loadFactor,
      bufferPct,
      clearanceUnderRoofFt,
      doorLayout: null,
      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single();

  if (error) {
    console.error("warehouse create:", error);
    return NextResponse.json({ error: "Failed to create warehouse" }, { status: 503 });
  }

  return NextResponse.json({ warehouse: w });
}
