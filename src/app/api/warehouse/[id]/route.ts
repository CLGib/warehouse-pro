import { auth } from "@/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const supabase = getSupabaseAdmin();

  const { data: existing, error: findErr } = await supabase
    .from("PlannerWarehouse")
    .select("*")
    .eq("id", id)
    .eq("userId", session.user.id)
    .maybeSingle();

  if (findErr) {
    console.error("warehouse patch find:", findErr);
    return NextResponse.json({ error: "Database error" }, { status: 503 });
  }
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

  data.updatedAt = new Date().toISOString();

  const { data: warehouse, error } = await supabase
    .from("PlannerWarehouse")
    .update(data)
    .eq("id", id)
    .eq("userId", session.user.id)
    .select()
    .single();

  if (error) {
    console.error("warehouse patch update:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 503 });
  }

  return NextResponse.json({ warehouse });
}
