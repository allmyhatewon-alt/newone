import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  username: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, underscores"),
  displayName: z.string().min(1).max(50),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { username, displayName, email, password } = parsed.data;

    // Check uniqueness
    const [existingEmail, existingUsername] = await Promise.all([
      prisma.user.findUnique({ where: { email: email.toLowerCase() }, select: { id: true } }),
      prisma.user.findUnique({
        where: { username: username.toLowerCase() },
        select: { id: true },
      }),
    ]);

    if (existingEmail) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    if (existingUsername) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Create user + hub profile + empty space in one transaction
    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          username: username.toLowerCase(),
          displayName,
          email: email.toLowerCase(),
          passwordHash,
          emailVerified: new Date(), // auto-verified (email sending is optional)
        },
        select: {
          id: true,
          username: true,
          displayName: true,
          email: true,
        },
      });

      // Create default hub profile
      await tx.hubProfile.create({
        data: {
          userId: u.id,
          portalLabel: "Enter My Space",
        },
      });

      // Create empty space
      await tx.space.create({
        data: {
          userId: u.id,
          blocks: [],
        },
      });

      return u;
    });

    return NextResponse.json({
      message: "Account created. Sign in to continue.",
      username: user.username,
    });
  } catch (error) {
    console.error("[register]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// Username availability check
export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");
  if (!username) return NextResponse.json({ available: false });

  if (
    username.length < 2 ||
    username.length > 30 ||
    !/^[a-zA-Z0-9_]+$/.test(username)
  ) {
    return NextResponse.json({ available: false, reason: "Invalid format" });
  }

  const existing = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { id: true },
  });

  return NextResponse.json({ available: !existing });
}
