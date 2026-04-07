import { auth } from "@/auth";
import { computePlan } from "@/lib/planner/engine";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
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

  const supabase = getSupabaseAdmin();

  const { data: wh, error: whErr } = await supabase
    .from("PlannerWarehouse")
    .select("*")
    .eq("id", warehouseId)
    .eq("userId", session.user.id)
    .maybeSingle();

  if (whErr) {
    console.error("plan GET warehouse:", whErr);
    return NextResponse.json({ error: "Database error" }, { status: 503 });
  }
  if (!wh) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: cargoRows, error: cargoErr } = await supabase
    .from("PlannerCargoLot")
    .select("*")
    .eq("warehouseId", warehouseId)
    .order("startAt", { ascending: true });

  if (cargoErr) {
    console.error("plan GET cargo:", cargoErr);
    return NextResponse.json({ error: "Database error" }, { status: 503 });
  }

  const cargoLots = cargoRows ?? [];

  const plan = computePlan(
    {
      sqFt: wh.sqFt as number,
      floorStrengthPsf: wh.floorStrengthPsf as number,
      roofHeightFt: wh.roofHeightFt as number,
      loadFactor: wh.loadFactor as number,
      bufferPct: wh.bufferPct as number,
      clearanceUnderRoofFt: wh.clearanceUnderRoofFt as number,
    },
    cargoLots.map((c) => ({
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

  return NextResponse.json({
    plan,
    warehouse: { id: wh.id as string, name: wh.name as string },
  });
}
