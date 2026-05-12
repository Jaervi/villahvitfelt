import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Media Serving API Route
 * 
 * Securely serves files from the persistent /app/uploads directory.
 * This avoids using the public folder which is static and immutable during builds.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    // 1. Check Authentication (Optional: remove if media should be public)
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { filename } = await params;
    
    // 2. Resolve Path
    const uploadDir = path.join(process.cwd(), "uploads");
    const filePath = path.join(uploadDir, filename);

    // 3. Security Check: Ensure the path is within the uploads directory
    if (!filePath.startsWith(uploadDir)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // 4. Read and Serve File
    const fileBuffer = await readFile(filePath);
    
    // Determine content type based on extension
    const ext = path.extname(filename).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".pdf": "application/pdf",
    };

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentTypeMap[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return new NextResponse("Not Found", { status: 404 });
  }
}
