"use server";

import { auth, db } from "@/lib/auth";
import { maintenanceTask, maintenanceLog, reservation, user } from "@/db/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

export async function getMaintenanceTasksWithProgress() {
  try {
    const tasks = await db.select().from(maintenanceTask).orderBy(maintenanceTask.createdAt);
    const allReservations = await db.select().from(reservation);

    const enrichedTasks = await Promise.all(tasks.map(async (task) => {
      const logs = await db.select()
        .from(maintenanceLog)
        .where(eq(maintenanceLog.taskId, task.id))
        .orderBy(desc(maintenanceLog.completedAt))
        .limit(1);
      
      const lastLog = logs[0] || null;
      const lastCompletedAt = lastLog ? new Date(lastLog.completedAt) : new Date(task.createdAt);
      const now = new Date();

      let progress = 0;
      let currentVal = 0;

      if (task.intervalType === "days") {
        const diffTime = Math.max(0, now.getTime() - lastCompletedAt.getTime());
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        currentVal = Math.floor(diffDays);
        progress = (diffDays / task.intervalValue) * 100;
      } else {
        // Person-days calculation: Usage between lastCompletedAt and NOW
        let totalPersonDays = 0;
        for (const res of allReservations) {
          const resStart = new Date(res.startDate);
          const resEnd = new Date(res.endDate);
          
          // Calculate the overlap of the reservation with [lastCompletedAt, now]
          const effectiveStart = new Date(Math.max(resStart.getTime(), lastCompletedAt.getTime()));
          const effectiveEnd = new Date(Math.min(resEnd.getTime(), now.getTime()));

          if (effectiveEnd > effectiveStart) {
            const diffTime = effectiveEnd.getTime() - effectiveStart.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            totalPersonDays += diffDays * res.attendees;
          }
        }
        currentVal = Math.floor(totalPersonDays);
        progress = (totalPersonDays / task.intervalValue) * 100;
      }

      let status = "good";
      if (progress >= 100) status = "overdue";
      else if (progress >= 75) status = "due-soon";

      return {
        ...task,
        lastLog,
        progress,
        currentVal,
        status,
      };
    }));

    return enrichedTasks;
  } catch (error) {
    console.error("Failed to fetch maintenance tasks:", error);
    return [];
  }
}

export async function createMaintenanceTask(data: {
  title: string;
  description: string | null;
  intervalType: string;
  intervalValue: number;
}) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Vain ylläpitäjät voivat luoda huoltotehtäviä." };
  }

  try {
    await db.insert(maintenanceTask).values(data);
    revalidatePath("/huolto");
    return { success: true };
  } catch (error) {
    console.error("Failed to create task:", error);
    return { success: false, error: "Tehtävän luominen epäonnistui." };
  }
}

export async function updateMaintenanceTask(id: string, data: Partial<typeof maintenanceTask.$inferInsert>) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Luvaton toimenpide." };
  }

  try {
    await db.update(maintenanceTask).set({ ...data, updatedAt: new Date() }).where(eq(maintenanceTask.id, id));
    revalidatePath("/huolto");
    return { success: true };
  } catch (error) {
    console.error("Failed to update task:", error);
    return { success: false, error: "Tehtävän päivitys epäonnistui." };
  }
}

export async function deleteMaintenanceTask(id: string) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Luvaton toimenpide." };
  }

  try {
    await db.delete(maintenanceTask).where(eq(maintenanceTask.id, id));
    revalidatePath("/huolto");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete task:", error);
    return { success: false, error: "Poistaminen epäonnistui." };
  }
}

export async function logTaskCompletion(taskId: string, notes: string | null, guestName?: string | null) {
  const session = await getSession();
  
  try {
    await db.insert(maintenanceLog).values({
      taskId,
      userId: session?.user.id || null,
      guestName: session ? null : guestName,
      notes,
    });
    revalidatePath("/huolto");
    return { success: true };
  } catch (error) {
    console.error("Failed to log task:", error);
    return { success: false, error: "Kirjaaminen epäonnistui." };
  }
}

export async function getMaintenanceHistory(taskId: string) {
  try {
    return await db.select({
      id: maintenanceLog.id,
      notes: maintenanceLog.notes,
      completedAt: maintenanceLog.completedAt,
      userName: user.name,
      guestName: maintenanceLog.guestName,
    })
    .from(maintenanceLog)
    .leftJoin(user, eq(maintenanceLog.userId, user.id))
    .where(eq(maintenanceLog.taskId, taskId))
    .orderBy(desc(maintenanceLog.completedAt))
    .limit(10);
  } catch (error) {
    console.error("Failed to fetch history:", error);
    return [];
  }
}
