"use server";
import { db } from "@/lib/db";
import { getValidTimesFromSchedule } from "@/lib/getValidTimesFromSchedule";
import { meetingActionSchema } from "@/schema/meetings";
import "use-server";
import { z } from "zod";
import { createCalendarEvent } from "../googleCalander";
import { redirect } from "next/navigation";
import { fromZonedTime } from "date-fns-tz";

export async function createMeeting(
  unsafeData: z.infer<typeof meetingActionSchema>
) {
  const { success, data } = meetingActionSchema.safeParse(unsafeData);
  if (!success === null || data == undefined) {
    return {
      error: "Either user is not login or Data is not correct",
    };
  }

  const event = await db.event.findFirst({
    where: {
      id: data.eventId,
      clerkUserId: data.clerkUserId,
      isActive: true,
    },
  });

  if (event == null) {
    return {
      error: "Event not found",
    };
  }
  const startInTimezone = fromZonedTime(data.startTime, data.timezone);
  const validTimes = await getValidTimesFromSchedule([startInTimezone], event);
  if (validTimes.length === 0) {
    return {
      error: "No valid times found",
    };
  }
  await createCalendarEvent({
    ...data,
    startTime: startInTimezone,
    durationInMinutes: event.durationInMinutes,
    eventName: event.name,
  });
  redirect(
    `/book/${data.clerkUserId}/${data.eventId}/success?start=${encodeURIComponent(data.startTime.toISOString())}`
  );
}
