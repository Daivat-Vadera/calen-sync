import { DAYS_OF_WEEK_IN_ORDER } from "@/data/constants";
import { timeToInt } from "@/lib/utils";
import { z } from "zod";

export const scheduleFormSchema = z.object({
  timezone: z.string().min(1, "Timezone is required"),
  availabilities: z
    .array(
      z.object({
        startTime: z
          .string()
          .regex(
            /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
            "Time must be in the format HH:MM"
          )
          .min(1, "Start time is required"),
        endTime: z
          .string()
          .regex(
            /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
            "Time must be in the format HH:MM"
          )
          .min(1, "End time is required"),
        dayOfWeek: z.enum(DAYS_OF_WEEK_IN_ORDER),
      })
    )
    .superRefine((availabilities, ctx) => {
      availabilities.forEach((availability, index) => {
        const overlaps = availabilities.some((a, i) => {
          return (
            i !== index &&
            a.dayOfWeek === availability.dayOfWeek &&
            timeToInt(a.startTime) < timeToInt(availability.endTime) &&
            timeToInt(a.endTime) > timeToInt(availability.startTime)
          );
        });
        if (overlaps) {
          ctx.addIssue({
            code: "custom",
            message: "Availabilities overlaps with another",
            path: [index],
          });
        }
        if (
          timeToInt(availability.startTime) >= timeToInt(availability.endTime)
        ) {
          ctx.addIssue({
            code: "custom",
            message: "Start time must be before end time",
            path: [index],
          });
        }
      });
    }),
});
