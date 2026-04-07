import { auth } from "@/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const supabase = getSupabaseAdmin();

  const { data: lot, error: lotErr } = await supabase
    .from("PlannerCargoLot")
    .select("id, warehouseId")
    .eq("id", id)
    .maybeSingle();

  if (lotErr) {
    console.error("cargo DELETE lot:", lotErr);
    return NextResponse.json({ error: "Database error" }, { status: 503 });
  }
  if (!lot) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: warehouse, error: whErr } = await supabase
    .from("PlannerWarehouse")
    .select("userId")
    .eq("id", lot.warehouseId as string)
    .maybeSingle();

  if (whErr || !warehouse || warehouse.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error: delErr } = await supabase
    .from("PlannerCargoLot")
    .delete()
    .eq("id", id);

  if (delErr) {
    console.error("cargo DELETE:", delErr);
    return NextResponse.json({ error: "Failed to delete" }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
