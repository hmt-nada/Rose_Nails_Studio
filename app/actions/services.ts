"use server";

import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Revalidates public services cache so the landing page booking form
 * immediately fetches the latest services and updated prices.
 */
export async function revalidateServicesCache() {
  try {
    revalidatePath("/api/services");
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/reservations");
    revalidateTag("services", "default");
  } catch (err) {
    console.error("Error revalidating services cache:", err);
  }
}
