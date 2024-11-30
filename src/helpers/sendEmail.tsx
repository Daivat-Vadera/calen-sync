import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { UserConfirmationEmail } from "@/emailTemplates/UserConfirmationEmail";
import { InviteeConfirmationEmail } from "@/emailTemplates/InviteeConfirmationEmail";
import { sub } from "date-fns";

interface sendEmailProps {
  email: string | undefined;
  username: string | null;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventDuration: string;
  eventLink: string | undefined;
  appName: string;
  inviteeName: string;
  inviteeEmail: string;
  userEventLink: string | undefined;
}

async function sendEmail({
  email,
  username,
  eventTitle,
  eventDate,
  eventTime,
  eventDuration,
  eventLink,
  appName,
  inviteeName,
  inviteeEmail,
  userEventLink,
}: sendEmailProps) {

const userEmailHtml = await render(
    <UserConfirmationEmail
      userName={username}
      eventTitle={eventTitle}
      eventDate={eventDate}
      eventTime={eventTime}
      eventDuration={eventDuration}
      eventLink={eventLink}
      appName={appName}
      userEventLink = {userEventLink}
    />
  );
  const inviteeEmailHtml = await render(
    <InviteeConfirmationEmail
      inviteeName={inviteeName}
      userName={username}
      eventTitle={eventTitle}
      eventDate={eventDate}
      eventTime={eventTime}
      eventDuration={eventDuration}
      eventLink={eventLink}
      appName={appName}
    />
  );

  var transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  const userMailOptions = {
    from: "hello@demomailtrap.com",
    to: email,
    html: userEmailHtml,
    subject: "Event Confirmation",
  };
  const inviteeMailOptions = {
    from: "hello@demomailtrap.com",
    to: inviteeEmail,
    html: inviteeEmailHtml,
    subject: "You're Invited!",
  };
  try {
    await transporter.sendMail(userMailOptions);
    await transporter.sendMail(inviteeMailOptions);
    return {
      success: true,
      message:  "Email send Successfully",
    };
  } catch (error: any) {
    console.log("Error Sending  Email");
    return {
      success: false,
      message: "Failed to send  Email",
    };
  }
}

export default sendEmail;