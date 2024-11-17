import EventCard from "@/components/EventCard";
import { db } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

export const revalidate = 0;

const BookingPage = async ({
  params: { clerkUserId },
}: {
  params: { clerkUserId: string };
}) => {
  const events = await db.event.findMany({
    where: {
      clerkUserId: clerkUserId,
      isActive: true,
    },
    orderBy: {
      name: "desc",
    },
  });

  if (events.length == 0) return notFound();

  const { fullName } = await (await clerkClient()).users.getUser(clerkUserId);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-4xl md:text-5xl font-semibold text-center mb-4">
        {fullName}
      </div>
      <div className="text-muted-foreground mb-6 max-w-sm mx-auto text-center">
        Welcome to my scheduling page. Please follow the instructions to add an
        event to my calendar.
      </div>
      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
        {events.map((event) => (
          <EventCard key={event.id} {...event} isItUsedOnBookingPage={true} />
        ))}
      </div>
    </div>
  );
};

export default BookingPage;
