import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Demo123!", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@warehouse.local" },
    update: { passwordHash },
    create: {
      email: "demo@warehouse.local",
      passwordHash,
      name: "Demo operator",
    },
  });

  const existing = await prisma.plannerWarehouse.findFirst({
    where: { userId: user.id },
  });

  if (!existing) {
    const wh = await prisma.plannerWarehouse.create({
      data: {
        userId: user.id,
        name: "Demo shed — general cargo",
        sqFt: 150_000,
        floorStrengthPsf: 250,
        roofHeightFt: 28,
        loadFactor: 0.8,
        bufferPct: 0.1,
        clearanceUnderRoofFt: 2,
      },
    });

    const now = new Date();
    const week = 7 * 24 * 60 * 60 * 1000;
    await prisma.plannerCargoLot.createMany({
      data: [
        {
          warehouseId: wh.id,
          label: "Steel coils — customer A",
          sqFt: 45_000,
          weightLbs: 4_000_000,
          stackHeightFt: 12,
          startAt: now,
          endAt: new Date(now.getTime() + week),
          priority: 10,
        },
        {
          warehouseId: wh.id,
          label: "Forest products — customer B",
          sqFt: 70_000,
          weightLbs: 2_200_000,
          stackHeightFt: 18,
          startAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
          endAt: new Date(now.getTime() + week),
          priority: 5,
        },
      ],
    });
  }

  console.log("Seed OK. Login: demo@warehouse.local / Demo123!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
