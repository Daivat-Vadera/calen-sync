"use client";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Fragment, useState, useTransition } from "react";
import { DAYS_OF_WEEK_IN_ORDER } from "@/data/constants";
import { scheduleFormSchema } from "@/schema/schedule";
import { timeToInt } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { formatTimezoneOffset } from "@/lib/formatters";
import { Plus, X } from "lucide-react";
import { saveSchedule } from "@/server/actions/schedule";

const ScheduleForm = ({
  schedule,
}: {
  schedule?: {
    availabilities: {
      id: string;
      scheduleId: string;
      startTime: string;
      endTime: string;
      dayOfWeek:
        | "monday"
        | "tuesday"
        | "wednesday"
        | "thursday"
        | "friday"
        | "saturday"
        | "sunday";
    }[];
  } & {
    id: string;
    timezone: string;
    clerkUserId: string;
    createdAt: Date;
    updatedAt: Date;
  };
}) => {
  const [successMessage, setSuccessMessage] = useState<string>("");
  const form = useForm<z.infer<typeof scheduleFormSchema>>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      timezone:
        schedule?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      availabilities: schedule?.availabilities.toSorted((a, b) => {
        return timeToInt(a.startTime) - timeToInt(b.startTime);
      }),
    },
  });
  const {
    append: addAvailability,
    remove: removeAvailability,
    fields: availabilityFields,
  } = useFieldArray({ name: "availabilities", control: form.control });

  const groupedAvailabilityFields = Object.groupBy(
    availabilityFields?.map((field, index) => ({ ...field, index })),
    ({ dayOfWeek }) => dayOfWeek
  );

  async function onSubmit(values: z.infer<typeof scheduleFormSchema>) {
    const data = await saveSchedule(values);
    if (data?.error) {
      form.setError("root", {
        message: "There was an error while saving your schedule",
      });
    } else {
      setSuccessMessage("Schedule saved successfully");
    }
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex gap-6 flex-col"
      >
        {form.formState.errors.root && (
          <div className="text-destructive text-sm">
            {form.formState.errors.root.message}
          </div>
        )}
        {successMessage && (
          <div className="text-sm text-green-500">{successMessage}</div>
        )}
        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timezone</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Intl.supportedValuesOf("timeZone").map((timezone) => (
                    <SelectItem key={timezone} value={timezone}>
                      {timezone}
                      {` (${formatTimezoneOffset(timezone)})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-[auto,1fr] gap-y-6 gap-x-4">
          {DAYS_OF_WEEK_IN_ORDER.map((dayOfWeek) => (
            <Fragment key={dayOfWeek}>
              <div className="capitalize text-sm font-semibold">
                {dayOfWeek.substring(0, 3)}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  className="size-6 p-1"
                  variant="outline"
                  onClick={() => {
                    addAvailability({
                      startTime: "9:00",
                      endTime: "17:00",
                      dayOfWeek,
                    });
                  }}
                >
                  <Plus className="size-full" />
                </Button>
                {groupedAvailabilityFields[dayOfWeek]?.map(
                  (field, labelIndex) => (
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-2 items-center">
                        <FormField
                          control={form.control}
                          name={`availabilities.${field.index}.startTime`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  className="w-24"
                                  aria-label={`${dayOfWeek} Start Time ${
                                    labelIndex + 1
                                  }`}
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        -
                        <FormField
                          control={form.control}
                          name={`availabilities.${field.index}.endTime`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  className="w-24"
                                  aria-label={`${dayOfWeek} End Time ${
                                    labelIndex + 1
                                  }`}
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Button
                          asChild
                          variant="destructiveGhost"
                          className="size-6 p-1"
                          onClick={() => {
                            removeAvailability(field.index);
                          }}
                        >
                          <X />
                        </Button>
                      </div>
                      <FormMessage>
                        {
                          form.formState.errors.availabilities?.at?.(
                            field.index
                          )?.root?.message
                        }
                      </FormMessage>
                      <FormMessage>
                        {
                          form.formState.errors.availabilities?.at?.(
                            field.index
                          )?.startTime?.message
                        }
                      </FormMessage>
                      <FormMessage>
                        {
                          form.formState.errors.availabilities?.at?.(
                            field.index
                          )?.endTime?.message
                        }
                      </FormMessage>
                    </div>
                  )
                )}
              </div>
            </Fragment>
          ))}
        </div>
        <div className="flex gap-2 justify-end">
          <Button disabled={form.formState.isSubmitting} type="submit">
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ScheduleForm;
