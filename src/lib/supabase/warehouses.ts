import { getSupabaseAdmin } from "./admin";

export type WarehouseWithCargoCount = {
  id: string;
  userId: string;
  name: string;
  sqFt: number;
  floorStrengthPsf: number;
  roofHeightFt: number;
  loadFactor: number;
  bufferPct: number;
  clearanceUnderRoofFt: number;
  createdAt: string;
  updatedAt: string;
  _count: { cargoLots: number };
};

export async function listWarehousesWithCounts(
  userId: string,
): Promise<WarehouseWithCargoCount[]> {
  const supabase = getSupabaseAdmin();
  const { data: warehouses, error } = await supabase
    .from("PlannerWarehouse")
    .select("*")
    .eq("userId", userId)
    .order("updatedAt", { ascending: false });

  if (error) throw error;
  if (!warehouses?.length) return [];

  const ids = warehouses.map((w) => w.id);
  const { data: lotRows, error: lotErr } = await supabase
    .from("PlannerCargoLot")
    .select("warehouseId")
    .in("warehouseId", ids);

  if (lotErr) throw lotErr;

  const countMap: Record<string, number> = {};
  for (const row of lotRows ?? []) {
    const wid = row.warehouseId as string;
    countMap[wid] = (countMap[wid] ?? 0) + 1;
  }

  return warehouses.map((w) => ({
    ...w,
    _count: { cargoLots: countMap[w.id] ?? 0 },
  })) as WarehouseWithCargoCount[];
}
