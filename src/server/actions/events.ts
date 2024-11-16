"use server";
import { db } from "@/lib/db";
import { eventFormSchema } from "@/schema/events";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import "use-server";
import { z } from "zod";

export async function createEvent(
  unsafeData: z.infer<typeof eventFormSchema>
): Promise<{ error: string } | undefined> {
  const { userId } = auth();
  const { success, data } = eventFormSchema.safeParse(unsafeData);
  if (!success || userId === null) {
    return {
      error: "Either user is not login or Data is not correct",
    };
  }
  const result = await db.event.create({
    data: { ...data, clerkUserId: userId },
  });
  if (result === null) {
    return {
      error: "Error while creating new Event",
    };
  }
  redirect("/events");
}
export async function updateEvent(
  id: string,
  unsafeData: z.infer<typeof eventFormSchema>
): Promise<{ error: string } | undefined> {
  const { userId } = auth();
  const { success, data } = eventFormSchema.safeParse(unsafeData);
  if (!success || userId === null) {
    return {
      error: "Either user is not login or Data is not correct",
    };
  }

  const result = await db.event.update({
    where: { id, clerkUserId: userId },
    data: { ...data, clerkUserId: userId },
  });

  if (result === null) {
    return {
      error: "Error while Updating Event",
    };
  }
  redirect("/events");
}
export async function deleteEvent(
  id: string
): Promise<{ error: string } | undefined> {
  const { userId } = auth();
  if (userId === null) {
    return {
      error: "User is not logged in",
    };
  }
  const result = await db.event.delete({
    where: { id, clerkUserId: userId },
  });

  if (result === null) {
    return {
      error: "Error while Deleting Event",
    };
  }
  redirect("/events");
}
export async function getEvent(clerkUserId: string, eventId: string) {
  const event = await db.event.findFirst({
    where: { id: eventId, clerkUserId, isActive: true },
  });
  return event;
}
