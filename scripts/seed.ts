import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env",
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const passwordHash = await bcrypt.hash("Demo123!", 12);
  const demoEmail = "demo@warehouse.local";

  const { data: existingUser } = await supabase
    .from("User")
    .select("id")
    .eq("email", demoEmail)
    .maybeSingle();

  let userId: string;

  if (existingUser) {
    userId = existingUser.id as string;
    const { error } = await supabase
      .from("User")
      .update({ passwordHash, name: "Demo operator" })
      .eq("id", userId);
    if (error) throw error;
  } else {
    userId = randomUUID();
    const now = new Date().toISOString();
    const { error } = await supabase.from("User").insert({
      id: userId,
      email: demoEmail,
      passwordHash,
      name: "Demo operator",
      createdAt: now,
    });
    if (error) throw error;
  }

  const { data: existingWh } = await supabase
    .from("PlannerWarehouse")
    .select("id")
    .eq("userId", userId)
    .limit(1)
    .maybeSingle();

  if (!existingWh) {
    const whId = randomUUID();
    const now = new Date().toISOString();
    const { error: whErr } = await supabase.from("PlannerWarehouse").insert({
      id: whId,
      userId,
      name: "Demo shed — general cargo",
      sqFt: 150_000,
      floorStrengthPsf: 250,
      roofHeightFt: 28,
      loadFactor: 0.8,
      bufferPct: 0.1,
      clearanceUnderRoofFt: 2,
      createdAt: now,
      updatedAt: now,
    });
    if (whErr) throw whErr;

    const t = Date.now();
    const week = 7 * 24 * 60 * 60 * 1000;
    const lots = [
      {
        id: randomUUID(),
        warehouseId: whId,
        label: "Steel coils — customer A",
        sqFt: 45_000,
        weightLbs: 4_000_000,
        stackHeightFt: 12,
        startAt: new Date(t).toISOString(),
        endAt: new Date(t + week).toISOString(),
        priority: 10,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        warehouseId: whId,
        label: "Forest products — customer B",
        sqFt: 70_000,
        weightLbs: 2_200_000,
        stackHeightFt: 18,
        startAt: new Date(t + 2 * 24 * 60 * 60 * 1000).toISOString(),
        endAt: new Date(t + week).toISOString(),
        priority: 5,
        createdAt: now,
        updatedAt: now,
      },
    ];

    const { error: lotsErr } = await supabase
      .from("PlannerCargoLot")
      .insert(lots);
    if (lotsErr) throw lotsErr;
  }

  console.log("Seed OK. Login: demo@warehouse.local / Demo123!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
