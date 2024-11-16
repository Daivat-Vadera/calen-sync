import ScheduleForm from "@/components/forms/ScheduleForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export const revalidate = 0;

const SchedulePage = async () => {
  const { userId, redirectToSignIn } = auth();
  if (userId == null) return redirectToSignIn();

  let schedule = await db.schedule.findFirst({
    where: {
      clerkUserId: userId,
    },
    include: {
      availabilities: true,
    },
  });
  const value = schedule === null ? undefined : schedule;
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <ScheduleForm
          schedule={value}
        />
      </CardContent>
    </Card>
  );
};

export default SchedulePage;
