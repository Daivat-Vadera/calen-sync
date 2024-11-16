import { DAYS_OF_WEEK_IN_ORDER } from "@/data/constants";
import { getSchedule } from "@/server/actions/schedule";
import { getCalendarTimes } from "@/server/googleCalander";
import { ScheduleAvailability } from "@prisma/client";
import {
  addMinutes,
  areIntervalsOverlapping,
  isFriday,
  isMonday,
  isSaturday,
  isSunday,
  isThursday,
  isTuesday,
  isWednesday,
  isWithinInterval,
  setHours,
  setMinutes,
} from "date-fns";
import { fromZonedTime } from "date-fns-tz";

export async function getValidTimesFromSchedule(
  timesInOrder: Date[],
  event: {
    clerkUserId: string;
    id: string;
    name: string;
    description: string | null;
    durationInMinutes: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
) {
  const start = timesInOrder[0];
  const end = timesInOrder.at(-1);

  if (start == null || end == null) {
    return [];
  }

  const schedule = await getSchedule(event.clerkUserId);
  if (schedule == null) {
    return [];
  }

  type GroupedItems<T> = {
    [key: string]: T[];
  };

  function groupBy<T, K extends keyof T>(array: T[], key: K): GroupedItems<T> {
    return array.reduce((result, currentItem) => {
      const groupKey = String(currentItem[key]); // Ensure the key is a string to be used as an object property
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(currentItem);
      return result;
    }, {} as GroupedItems<T>);
  }
  const groupAvailabilities = groupBy(schedule.availabilities, "dayOfWeek");

  const eventTimes = await getCalendarTimes(event.clerkUserId, { start, end });
  const result = timesInOrder.filter((intervalDate) => {
    const availabilities = getAvailabilities(
      groupAvailabilities,
      intervalDate,
      schedule.timezone
    );
    const eventInterval = {
      start: intervalDate,
      end: addMinutes(intervalDate, event.durationInMinutes),
    };
    return (
      eventTimes.every((eventTime) => {
        return !areIntervalsOverlapping(eventTime, eventInterval);
      }) &&
      availabilities.some((availability) => {
        return (
          isWithinInterval(eventInterval.start, availability) &&
          isWithinInterval(eventInterval.end, availability)
        );
      })
    );
  });
  return result;
}

function getAvailabilities(
  groupedAvailabilities: Partial<
    Record<(typeof DAYS_OF_WEEK_IN_ORDER)[number], ScheduleAvailability[]>
  >,
  date: Date,
  timezone: string
) {
  let availabilities: ScheduleAvailability[] | undefined;

  if (isMonday(date)) {
    availabilities = groupedAvailabilities.monday;
  }
  if (isTuesday(date)) {
    availabilities = groupedAvailabilities.tuesday;
  }
  if (isWednesday(date)) {
    availabilities = groupedAvailabilities.wednesday;
  }
  if (isThursday(date)) {
    availabilities = groupedAvailabilities.thursday;
  }
  if (isFriday(date)) {
    availabilities = groupedAvailabilities.friday;
  }
  if (isSaturday(date)) {
    availabilities = groupedAvailabilities.saturday;
  }
  if (isSunday(date)) {
    availabilities = groupedAvailabilities.sunday;
  }
  if (availabilities == null) return [];
  return availabilities.map(({ startTime, endTime }) => {
    const start = fromZonedTime(
      setMinutes(
        setHours(date, parseInt(startTime.split(":")[0])),
        parseInt(startTime.split(":")[1])
      ),
      timezone
    );
    const end = fromZonedTime(
      setMinutes(
        setHours(date, parseInt(endTime.split(":")[0])),
        parseInt(endTime.split(":")[1])
      ),
      timezone
    );
    return { start, end };
  });
}
