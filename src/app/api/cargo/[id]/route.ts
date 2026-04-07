import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const lot = await prisma.plannerCargoLot.findUnique({
    where: { id },
    include: { warehouse: true },
  });
  if (!lot || lot.warehouse.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.plannerCargoLot.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
