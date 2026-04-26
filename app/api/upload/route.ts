import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const uploadSchema = z.object({
  filename: z.string().min(1).max(200),
  contentType: z.enum(["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg"]),
  sizeBytes: z.number().max(50 * 1024 * 1024), // 50MB max
  title: z.string().optional(),
  artist: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Gems required for MP3 uploads
  const user = session.user as any;
  if (!user.gemsUnlocked) {
    return NextResponse.json(
      { error: "MP3 uploads require Gems. Unlock the Gems tier to continue." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const parsed = uploadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { filename, contentType, sizeBytes, title, artist } = parsed.data;
  const userId = user.id as string;

  // Generate unique R2 key
  const ext = filename.split(".").pop() ?? "mp3";
  const r2Key = `audio/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  // Create signed upload URL (valid 5 minutes)
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: r2Key,
    ContentType: contentType,
    ContentLength: sizeBytes,
    Metadata: {
      userId,
      title: title ?? filename,
      artist: artist ?? "",
    },
  });

  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 });
  const publicUrl = `${process.env.R2_PUBLIC_URL}/${r2Key}`;

  // Pre-register in DB (confirmed=false until client confirms upload)
  const upload = await prisma.audioUpload.create({
    data: {
      userId,
      filename,
      r2Key,
      r2Url: publicUrl,
      sizeBytes,
      title: title ?? filename,
      artist,
    },
  });

  return NextResponse.json({
    uploadUrl,
    publicUrl,
    uploadId: upload.id,
    r2Key,
  });
}
