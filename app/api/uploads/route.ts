import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireListingsAccess } from "@/lib/auth/requireSession";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ secure: true });
}

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Extension mapping
const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(req: NextRequest) {
  const { response: authError } = await requireListingsAccess();
  if (authError) return authError;

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, WEBP, or GIF images are allowed." },
        { status: 400 }
      );
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Image is too large (max 8MB)." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. If Cloudinary is configured, upload to Cloudinary
    if (process.env.CLOUDINARY_URL) {
      try {
        const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
        const result = await cloudinary.uploader.upload(base64, {
          folder: "dreamx/listings",
          resource_type: "image",
        });
        return NextResponse.json({ data: { url: result.secure_url } }, { status: 201 });
      } catch (cloudErr) {
        console.warn("Cloudinary upload failed, falling back to local storage:", cloudErr);
      }
    }

    // 2. Local fallback storage (works offline, in dev, and without Cloudinary keys)
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = EXT_MAP[file.type] || "jpg";
    const uniqueName = `listing_${Date.now()}_${crypto.randomBytes(6).toString("hex")}.${ext}`;
    const filePath = path.join(uploadsDir, uniqueName);

    await fs.promises.writeFile(filePath, buffer);

    const localUrl = `/uploads/${uniqueName}`;
    return NextResponse.json({ data: { url: localUrl } }, { status: 201 });
  } catch (err) {
    console.error("POST /api/uploads failed:", err);
    return NextResponse.json({ error: "Failed to upload image. Please try again." }, { status: 500 });
  }
}
