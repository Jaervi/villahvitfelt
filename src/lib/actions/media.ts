"use server";

import { auth, db } from "@/lib/auth";
import { media } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { unlink } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function deleteMedia(id: string, relatedType: string, relatedId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    // 1. Get media record
    const [item] = await db.select().from(media).where(eq(media.id, id));
    if (!item) return { success: false, error: "Media not found" };

    // 2. Delete from filesystem
    // filePath in DB is now "/api/media/uuid.ext"
    const fileName = item.filePath.split("/").pop();
    if (!fileName) return { success: false, error: "Invalid file path" };

    const diskPath = path.join(process.cwd(), "uploads", fileName);
    try {
      await unlink(diskPath);
    } catch (e) {
      console.warn("[MEDIA_ACTION] Could not delete file from disk:", diskPath);
    }

    // 3. Delete from DB
    await db.delete(media).where(eq(media.id, id));

    // 4. Revalidate
    if (relatedType === "project") {
      revalidatePath(`/projects/${relatedId}`);
    } else if (relatedType === "guide") {
      revalidatePath(`/oppaat/${relatedId}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("[MEDIA_ACTION] Delete error:", error);
    return { success: false, error: "Deletion failed" };
  }
}

export async function getGuideMedia(guideId: string) {
  try {
    return await db.select()
      .from(media)
      .where(and(eq(media.relatedType, "guide"), eq(media.relatedId, guideId)));
  } catch (error) {
    console.error("[MEDIA_ACTION] Fetch error:", error);
    return [];
  }
}
