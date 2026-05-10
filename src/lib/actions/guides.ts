"use server";

import { auth, db } from "@/lib/auth";
import { guide } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

export async function getGuides() {
  try {
    return await db.select().from(guide).orderBy(asc(guide.category), asc(guide.order));
  } catch (error) {
    console.error("Failed to fetch guides:", error);
    return [];
  }
}

export async function getGuideById(id: string) {
  try {
    const results = await db.select().from(guide).where(eq(guide.id, id)).limit(1);
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error("Failed to fetch guide:", error);
    return null;
  }
}

export async function createGuide(data: {
  title: string;
  category: string;
  content: string;
}) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Vain ylläpitäjät voivat luoda oppaita." };
  }

  try {
    const [newGuide] = await db.insert(guide).values(data).returning();
    revalidatePath("/oppaat");
    return { success: true, guide: newGuide };
  } catch (error) {
    console.error("Failed to create guide:", error);
    return { success: false, error: "Oppaan luominen epäonnistui." };
  }
}

export async function updateGuide(id: string, data: Partial<typeof guide.$inferInsert>) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Luvaton toimenpide." };
  }

  try {
    await db.update(guide).set({ ...data, updatedAt: new Date() }).where(eq(guide.id, id));
    revalidatePath("/oppaat");
    revalidatePath(`/oppaat/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update guide:", error);
    return { success: false, error: "Päivitys epäonnistui." };
  }
}

export async function deleteGuide(id: string) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Luvaton toimenpide." };
  }

  try {
    await db.delete(guide).where(eq(guide.id, id));
    revalidatePath("/oppaat");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete guide:", error);
    return { success: false, error: "Poistaminen epäonnistui." };
  }
}
