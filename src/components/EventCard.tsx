import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { formatEventDescription } from "@/lib/formatters";
import { Button } from "./ui/button";
import Link from "next/link";
import CopyEventButton from "./CopyEventButton";
import { cn } from "@/lib/utils";
type EventCardProps = {
  id: string;
  isActive: boolean;
  name: string;
  description: string | null;
  durationInMinutes: number;
  clerkUserId: string;
  isItUsedOnBookingPage: boolean;
};

const EventCard = ({
  id,
  isActive,
  name,
  description,
  durationInMinutes,
  clerkUserId,
  isItUsedOnBookingPage,
}: EventCardProps) => {
  return (
    <Card
      className={cn("flex flex-col", !isActive && "border-secondary/50")}
      key={id}
    >
      <CardHeader className={cn(!isActive && "opacity-50")}>
        <CardTitle>{name}</CardTitle>
        <CardDescription>
          {formatEventDescription(durationInMinutes)}
        </CardDescription>
      </CardHeader>
      {description != null && (
        <CardContent className={cn(!isActive && "opacity-50")}>
          {description}
        </CardContent>
      )}
      <CardFooter className="flex justify-end gap-2 mt-auto">
        {!isItUsedOnBookingPage && (
          <>
            {isActive && (
              <CopyEventButton
                variant="outline"
                eventId={id}
                clerkUserId={clerkUserId}
              />
            )}
          </>
        )}

        <Button asChild>
          {isItUsedOnBookingPage ? (
            <Link href={`/book/${clerkUserId}/${id}`}>Select</Link>
          ) : (
            <Link href={`/events/${id}/edit`}>Edit</Link>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
