"use server";

import { auth, db } from "@/lib/auth";
import { reservation, user } from "@/db/schema";
import { eq, and, gte, lte, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

export async function getReservations(month?: number, year?: number) {
  try {
    // Basic fetch of all reservations for now, 
    // we can optimize with date ranges if the table gets huge.
    return await db.select().from(reservation).orderBy(reservation.startDate);
  } catch (error) {
    console.error("Failed to fetch reservations:", error);
    return [];
  }
}

export async function createReservation(data: {
  reserveeName: string;
  startDate: Date;
  endDate: Date;
  attendees: number;
  isRestricted: boolean;
}) {
  const session = await getSession();
  const userId = session?.user.id || null;

  // Security: Only logged in users can mark a reservation as restricted
  if (data.isRestricted && !userId) {
    return { success: false, error: "Vain kirjautuneet käyttäjät voivat rajoittaa varauksen poistamista." };
  }

  try {
    await db.insert(reservation).values({
      ...data,
      userId,
    });
    revalidatePath("/calendar");
    revalidatePath("/stats");
    return { success: true };
  } catch (error) {
    console.error("Failed to create reservation:", error);
    return { success: false, error: "Varauksen luominen epäonnistui." };
  }
}

export async function deleteReservation(id: string) {
  const session = await getSession();
  
  try {
    const existing = await db.select().from(reservation).where(eq(reservation.id, id)).limit(1);
    if (existing.length === 0) return { success: false, error: "Varausta ei löytynyt." };

    const res = existing[0];

    // High-trust check:
    // 1. If not restricted, anyone can delete.
    // 2. If restricted, only creator or admin can delete.
    if (res.isRestricted) {
      if (!session) return { success: false, error: "Tämä varaus on suojattu. Kirjaudu sisään poistaaksesi sen." };
      if (session.user.id !== res.userId && session.user.role !== "admin") {
        return { success: false, error: "Vain varauksen tekijä tai ylläpitäjä voi poistaa tämän suojatun varauksen." };
      }
    }

    await db.delete(reservation).where(eq(reservation.id, id));
    revalidatePath("/calendar");
    revalidatePath("/stats");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete reservation:", error);
    return { success: false, error: "Poistaminen epäonnistui." };
  }
}

export async function updateReservation(id: string, data: {
  reserveeName: string;
  startDate: Date;
  endDate: Date;
  attendees: number;
  isRestricted: boolean;
}) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Luvaton toimenpide" };
  }

  try {
    await db.update(reservation).set(data).where(eq(reservation.id, id));
    revalidatePath("/calendar");
    revalidatePath("/stats");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to update reservation:", error);
    return { success: false, error: "Varauksen päivitys epäonnistui." };
  }
}

export async function getStats() {
  try {
    const all = await db.select().from(reservation);
    
    const totalReservations = all.length;
    const totalAttendees = all.reduce((sum, r) => sum + r.attendees, 0);
    
    // Calculate total days (simplified)
    const totalDays = all.reduce((sum, r) => {
      const diff = r.endDate.getTime() - r.startDate.getTime();
      return sum + Math.ceil(diff / (1000 * 3600 * 24));
    }, 0);

    return {
      totalReservations,
      totalAttendees,
      totalDays,
    };
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return { totalReservations: 0, totalAttendees: 0, totalDays: 0 };
  }
}
