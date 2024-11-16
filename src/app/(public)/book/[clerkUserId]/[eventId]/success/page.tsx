import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/formatters";
import { clerkClient } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function SuccessPage({
  params: { clerkUserId, eventId },
  searchParams: { start },
}: {
  params: { clerkUserId: string; eventId: string };
  searchParams: { start: string };
}) {
  const event = await db.event.findFirst({
    where: {
      id: eventId,
      clerkUserId: clerkUserId,
      isActive: true,
    },
  });

  if (event == null) notFound();

  const calendarUser = await clerkClient().users.getUser(clerkUserId);
  const startTimeDate = new Date(start);

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>
          Successfully Booked {event.name} with {calendarUser.fullName}
        </CardTitle>
        <CardDescription>{formatDateTime(startTimeDate)}</CardDescription>
      </CardHeader>
      <CardContent>
        You should receive an email confirmation shortly. You can safely close
        this page now.
      </CardContent>
    </Card>
  );
}
