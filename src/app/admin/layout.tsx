import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Admin Layout - Secure Server-Side Validation
 * 
 * This component runs on the Server (Node.js runtime) and performs the 
 * definitive authentication and authorization check against the database.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 1. Check if authenticated
  if (!session) {
    redirect("/login");
  }

  // 2. Check if admin
  if (session.user.role !== "admin") {
    console.warn(`Unauthorized access attempt to /admin by user: ${session.user.email}`);
    redirect("/");
  }

  // 3. Authorized
  return <>{children}</>;
}
