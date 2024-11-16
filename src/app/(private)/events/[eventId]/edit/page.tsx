import EventForm from "@/components/forms/EventForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
export const revalidate = 0;
const EditEventPage = async ({
  params: { eventId },
}: {
  params: { eventId: string };
}) => {
  const { userId, redirectToSignIn } = auth();

  if (userId == null) return redirectToSignIn();

  const event = await db.event.findFirst({
    where: {
      id: eventId,
      clerkUserId: userId,
    },
  });
  if (event == null) return notFound();

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Edit Event </CardTitle>
      </CardHeader>
      <CardContent>
        <EventForm
          event={{ ...event, description: event.description || undefined }}
        />
      </CardContent>
    </Card>
  );
};

export default EditEventPage;
