import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).nullable().optional(),
  image: z.string().nullable().optional(),
  bannerUrl: z.string().nullable().optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: parsed.data,
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      image: true,
      bannerUrl: true,
      accentColor: true,
    },
  });
  return NextResponse.json({ user: updated });
}
