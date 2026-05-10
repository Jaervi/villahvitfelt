"use server";

import { auth, db } from "@/lib/auth";
import { invite } from "@/db/schema";
import { eq, and, gt, isNull } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

export async function createInvite(email: string, role: "admin" | "user" = "user") {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Luvaton toimenpide" };
  }

  const code = uuidv4().split("-")[0].toUpperCase();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  try {
    await db.insert(invite).values({
      email,
      code,
      role,
      expiresAt,
    });
    revalidatePath("/admin");
    return { success: true, code };
  } catch (error) {
    console.error("Failed to create invite:", error);
    return { success: false, error: "Kutsun luominen epäonnistui" };
  }
}

export async function validateInvite(code: string) {
  try {
    const results = await db
      .select()
      .from(invite)
      .where(
        and(
          eq(invite.code, code),
          isNull(invite.claimedAt),
          gt(invite.expiresAt, new Date())
        )
      )
      .limit(1);

    if (results.length === 0) {
      return { valid: false, error: "Virheellinen, käytetty tai vanhentunut kutsuavain" };
    }

    return { valid: true, invite: results[0] };
  } catch (error) {
    console.error("Failed to validate invite:", error);
    return { valid: false, error: "Palvelinvirhe kutsun tarkistuksessa" };
  }
}

export async function claimInvite(code: string) {
  try {
    await db
      .update(invite)
      .set({ claimedAt: new Date() })
      .where(eq(invite.code, code));
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to claim invite:", error);
    return { success: false };
  }
}

export async function getInvites() {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return [];
  }

  try {
    return await db.select().from(invite).orderBy(invite.createdAt);
  } catch (error) {
    console.error("Failed to fetch invites:", error);
    return [];
  }
}

export async function checkDbConnection() {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return false;
  }

  try {
    await db.execute("SELECT 1");
    return true;
  } catch (error) {
    console.error("DB Connection Check Failed:", error);
    return false;
  }
}
