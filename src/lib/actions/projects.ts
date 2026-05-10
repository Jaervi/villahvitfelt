"use server";

import { auth, db } from "@/lib/auth";
import { project, projectTask, projectItem, user, media, projectStatusEnum } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

// PROJECT ACTIONS
export async function getProjects() {
  try {
    return await db.select().from(project).orderBy(desc(project.createdAt));
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return [];
  }
}

export async function getProjectById(id: string) {
  const session = await getSession();

  try {
    const projects = await db.select().from(project).where(eq(project.id, id)).limit(1);
    if (projects.length === 0) return null;

    // If no session, return only basic public info
    if (!session) {
      return {
        ...projects[0],
        tasks: [],
        items: [],
        media: [],
        isGuestView: true,
      };
    }

    const [tasks, items, relatedMedia] = await Promise.all([
      db.select().from(projectTask).where(eq(projectTask.projectId, id)).orderBy(projectTask.createdAt),
      db.select().from(projectItem).where(eq(projectItem.projectId, id)).orderBy(projectItem.createdAt),
      db.select().from(media).where(and(eq(media.relatedType, "project"), eq(media.relatedId, id))),
    ]);

    return {
      ...projects[0],
      tasks,
      items,
      media: relatedMedia,
      isGuestView: false,
    };
  } catch (error) {
    console.error("Failed to fetch project detail:", error);
    return null;
  }
}

export async function createProject(data: {
  title: string;
  description: string;
  status: string;
  priority: string;
  budget: number;
}) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Vain ylläpitäjät voivat luoda projekteja." };
  }

  try {
    const [newProject] = await db.insert(project).values(data).returning();
    revalidatePath("/projects");
    return { success: true, project: newProject };
  } catch (error) {
    console.error("Failed to create project:", error);
    return { success: false, error: "Projektin luominen epäonnistui." };
  }
}

export async function updateProject(id: string, data: Partial<typeof project.$inferInsert>) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Luvaton toimenpide." };
  }

  try {
    await db.update(project).set({ ...data, updatedAt: new Date() }).where(eq(project.id, id));
    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update project:", error);
    return { success: false, error: "Päivitys epäonnistui." };
  }
}

export async function deleteProject(id: string) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Luvaton toimenpide." };
  }

  try {
    await db.delete(project).where(eq(project.id, id));
    revalidatePath("/projects");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete project:", error);
    return { success: false, error: "Poistaminen epäonnistui." };
  }
}

export async function updateProjectStatus(id: string, status: typeof projectStatusEnum[number]) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Luvaton toimenpide." };
  }

  try {
    await db.update(project).set({ status, updatedAt: new Date() }).where(eq(project.id, id));
    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update project status:", error);
    return { success: false, error: "Tilan päivitys epäonnistui." };
  }
}

export async function updateProjectNotes(id: string, notes: string) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Luvaton toimenpide." };
  }

  try {
    await db.update(project).set({ notes, updatedAt: new Date() }).where(eq(project.id, id));
    revalidatePath(`/projects/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update project notes:", error);
    return { success: false, error: "Muistiinpanojen tallennus epäonnistui." };
  }
}

// TASK ACTIONS
export async function createProjectTask(data: {
  projectId: string;
  title: string;
  assigneeName?: string | null;
}) {
  const session = await getSession();
  if (!session) return { success: false, error: "Kirjaudu sisään lisätäksesi tehtäviä." };

  try {
    await db.insert(projectTask).values(data);
    revalidatePath(`/projects/${data.projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to create task:", error);
    return { success: false, error: "Tehtävän luominen epäonnistui." };
  }
}

export async function toggleProjectTask(id: string, projectId: string, isCompleted: boolean) {
  const session = await getSession();
  if (!session) return { success: false, error: "Kirjaudu sisään kuitataksesi tehtäviä." };

  try {
    await db.update(projectTask).set({ isCompleted, updatedAt: new Date() }).where(eq(projectTask.id, id));
    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle task:", error);
    return { success: false, error: "Tilan päivitys epäonnistui." };
  }
}

export async function deleteProjectTask(id: string, projectId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Kirjaudu sisään poistaaksesi tehtäviä." };

  try {
    await db.delete(projectTask).where(eq(projectTask.id, id));
    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete task:", error);
    return { success: false, error: "Poistaminen epäonnistui." };
  }
}

// ITEM ACTIONS
export async function createProjectItem(data: {
  projectId: string;
  name: string;
  estimatedCost: number;
  link?: string | null;
}) {
  const session = await getSession();
  if (!session) return { success: false, error: "Kirjaudu sisään lisätäksesi hankintoja." };

  try {
    await db.insert(projectItem).values(data);
    revalidatePath(`/projects/${data.projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to create item:", error);
    return { success: false, error: "Hankinnan luominen epäonnistui." };
  }
}

export async function toggleProjectItemProcured(id: string, projectId: string, isProcured: boolean) {
  const session = await getSession();
  if (!session) return { success: false, error: "Kirjaudu sisään kuitataksesi hankintoja." };

  try {
    await db.update(projectItem).set({ isProcured }).where(eq(projectItem.id, id));
    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle item procured status:", error);
    return { success: false, error: "Tilan päivitys epäonnistui." };
  }
}

export async function deleteProjectItem(id: string, projectId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Kirjaudu sisään poistaaksesi hankintoja." };

  try {
    await db.delete(projectItem).where(eq(projectItem.id, id));
    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete item:", error);
    return { success: false, error: "Poistaminen epäonnistui." };
  }
}
