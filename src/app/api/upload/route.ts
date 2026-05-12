import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/auth";
import { headers } from "next/headers";
import { media } from "@/db/schema";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    // 1. Check Authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse FormData
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const relatedType = formData.get("relatedType") as string;
    const relatedId = formData.get("relatedId") as string;

    if (!file || !relatedType || !relatedId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3. Prepare File Saving
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExtension}`;
    
    // Use a root folder outside of public for persistent storage
    const uploadDir = path.join(process.cwd(), "uploads");
    
    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, fileName);
    const relativePath = `/api/media/${fileName}`;

    // 4. Write File
    await writeFile(filePath, buffer);

    // 5. Save to DB
    const [newMedia] = await db.insert(media).values({
      fileName: file.name,
      filePath: relativePath,
      fileType: file.type,
      relatedType,
      relatedId,
    }).returning();

    return NextResponse.json(newMedia);
  } catch (error: any) {
    console.error("[UPLOAD_API] Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
