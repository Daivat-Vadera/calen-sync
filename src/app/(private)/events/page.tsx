import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { generateGoogleCalendarLink } from "@/emailTemplates/InviteeConfirmationEmail";
import { db } from "@/lib/db";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { CalendarPlus, CalendarRange } from "lucide-react";
import Link from "next/link";
import React from "react";
export const revalidate = 0;
async function Page() {
  const { userId, redirectToSignIn } = await auth();
  if (userId == null) return redirectToSignIn();
  const events = await db.event.findMany({
    where: {
      clerkUserId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <>
      <div className="flex gap-4 items-baseline">
        <h1 className="text-3xl lg:text-4xl xl:text-5x font-semibold mb-6">
          Events
        </h1>
        <Button asChild>
          <Link href="/events/new">
            <CalendarPlus className="mr-4 size-6" />
            New Event
          </Link>
        </Button>
      </div>
      {events.length > 0 ? (
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(400px,1fr))]">
          {events.map((event) => (
            <EventCard key={event.id} {...event} isItUsedOnBookingPage={false} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 ">
          <CalendarRange className="size-16 mx-auto" />
          You do not have any events yet. Create your first event to get
          started!
          <Button size={"lg"} className="text-lg" asChild>
            <Link href="/events/new">
              <CalendarPlus className="mr-4 size-6" />
              New Event
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}

export default Page;
