"use server";
import { db } from "@/lib/db";
import { scheduleFormSchema } from "@/schema/schedule";
import { auth } from "@clerk/nextjs/server";
import "use-server";
import { z } from "zod";

export async function saveSchedule(
  unsafeData: z.infer<typeof scheduleFormSchema>
) {
  const { userId } = auth();
  const { success, data } = scheduleFormSchema.safeParse(unsafeData);
  if (!success || userId === null) {
    return {
      error: "Either user is not login or Data is not correct",
    };
  }
  const { availabilities, ...scheduleData } = data;
  const foundedSchedule = await db.schedule.findFirst({
    where: { clerkUserId: userId },
  });
  let updatedOrNewSchedule;
  let createScheduleAvailability;
  if (foundedSchedule) {
    updatedOrNewSchedule = await db.schedule.update({
      where: { id: foundedSchedule.id },
      data: { ...scheduleData },
    });
  } else {
    updatedOrNewSchedule = await db.schedule.create({
      data: {
        ...scheduleData,
        clerkUserId: userId,
      },
    });
  }
  if (availabilities.length > 0) {
    await db.scheduleAvailability.deleteMany({
      where: { scheduleId: updatedOrNewSchedule.id },
    });
    createScheduleAvailability = await db.scheduleAvailability.createMany({
      data: availabilities.map((availability) => ({
        ...availability,
        scheduleId: updatedOrNewSchedule.id,
      })),
    });
  }
  if (createScheduleAvailability == null) {
    return {
      error: "Error while creating schedule availability",
    };
  }
}
export async function getSchedule(clerkUserId: string) {
  const schedule = await db.schedule.findFirst({
    where: { clerkUserId },
    include: {
      availabilities: true,
    },
  });
  return schedule;
}
