"use server";
import { clerkClient } from "@clerk/nextjs/server";
import "use-server";
import { google } from "googleapis";
import { addMinutes, endOfDay, startOfDay } from "date-fns";

export async function getCalendarTimes(
  clerkUserID: string,
  {
    start,
    end,
  }: {
    start: Date;
    end: Date;
  }
) {
  const oAuthClient = await getOAuthClient(clerkUserID);
  const events = await google.calendar("v3").events.list({
    auth: oAuthClient,
    calendarId: "primary",
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: true,
    eventTypes: ["default"],
    maxResults: 2500,
  });
  return (
    events.data.items
      ?.map((event) => {
        if (event.start?.date != null && event.end?.date != null) {
          return {
            start: startOfDay(event.start.date),
            end: endOfDay(event.end.date),
          };
        }
        if (event.start?.dateTime != null && event.end?.dateTime != null) {
          return {
            start: new Date(event.start.dateTime),
            end: new Date(event.end.dateTime),
          };
        }
      })
      .filter((date) => date != null) || []
  );
}

export async function createCalendarEvent({
  clerkUserId,
  guestName,
  guestEmail,
  startTime,
  guestNotes,
  durationInMinutes,
  eventName,
}: {
  clerkUserId: string;
  guestName: string;
  guestEmail: string;
  startTime: Date;
  guestNotes?: string | null;
  durationInMinutes: number;
  eventName: string;
}) {
  const oAuthClient = await getOAuthClient(clerkUserId);
  const calendarUser = await (await clerkClient()).users.getUser(clerkUserId);
  if (calendarUser.primaryEmailAddress == null) {
    throw new Error("Clerk user has no email");
  }

  const calendarEvent = await google.calendar("v3").events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    auth: oAuthClient,
    sendUpdates: "all",
    requestBody: {
      attendees: [
        { email: guestEmail, displayName: guestName },
        {
          email: calendarUser.primaryEmailAddress.emailAddress,
          displayName: calendarUser.fullName,
          responseStatus: "accepted",
        },
      ],
      description: guestNotes ? `Additional Details: ${guestNotes}` : undefined,
      start: {
        dateTime: startTime.toISOString(),
      },
      end: {
        dateTime: addMinutes(startTime, durationInMinutes).toISOString(),
      },
      summary: `${guestName} + ${calendarUser.fullName}: ${eventName}`,
      conferenceData: {
        createRequest: {
          requestId: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          conferenceSolutionKey: {
            type: "hangoutsMeet"
          }
        }
      },
    },
  });

  return calendarEvent.data;
}

async function getOAuthClient(clerkUserID: string) {
  const token = await (
    await clerkClient()
  ).users.getUserOauthAccessToken(clerkUserID, "oauth_google");
  if (token.data.length === 0 || token.data[0].token == null) {
    return;
  }

  const client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URL
  );
  client.setCredentials({ access_token: token.data[0].token });
  return client;
}
