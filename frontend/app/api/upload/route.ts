import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { z } from "zod";

const ALLOWED = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/x-wav",
  "audio/mp4",
]);

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const title = (formData.get("title") as string | null) ?? null;
  const artist = (formData.get("artist") as string | null) ?? null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type}` },
      { status: 415 }
    );
  }

  const maxBytes = parseInt(process.env.MAX_UPLOAD_BYTES ?? "52428800", 10);
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: `File too large. Max ${(maxBytes / 1024 / 1024) | 0}MB.` },
      { status: 413 }
    );
  }

  // Save to UPLOAD_DIR/audio/<userId>/<timestamp>-<safe-name>
  const uploadDirRaw = process.env.UPLOAD_DIR ?? "./public/uploads";
  const uploadDir = path.isAbsolute(uploadDirRaw)
    ? uploadDirRaw
    : path.join(process.cwd(), uploadDirRaw);
  const userDir = path.join(uploadDir, "audio", user.id);
  await mkdir(userDir, { recursive: true });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const ts = Date.now();
  const fname = `${ts}-${safeName}`;
  const filePath = path.join(userDir, fname);

  const arrayBuffer = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(arrayBuffer));

  const publicBase = process.env.UPLOAD_PUBLIC_PATH ?? "uploads";
  const publicUrl = `/${publicBase}/audio/${user.id}/${fname}`;
  const storageKey = `audio/${user.id}/${fname}`;

  const upload = await prisma.audioUpload.create({
    data: {
      userId: user.id,
      filename: file.name,
      storageKey,
      url: publicUrl,
      sizeBytes: file.size,
      title: title ?? file.name,
      artist,
    },
  });

  return NextResponse.json({
    ok: true,
    upload,
  });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uploads = await prisma.audioUpload.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ uploads });
}

// Use Node runtime so we can write to disk (default would be edge/serverless on Vercel)
export const runtime = "nodejs";

// Disable body size limit on Next.js for large MP3 uploads (we enforce our own MAX)
export const dynamic = "force-dynamic";
