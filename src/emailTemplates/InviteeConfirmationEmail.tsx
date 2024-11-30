import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Hr,
} from "@react-email/components";

export const InviteeConfirmationEmail = ({
  inviteeName,
  userName,
  eventTitle,
  eventDate,
  eventTime,
  eventDuration,
  eventLink,
  appName,
}: {
  inviteeName: string;
  userName: string | null;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventDuration: string;
  eventLink: string | undefined;
  appName: string;
}) => (
  <Html>
    <Head />
    <Preview>{`You're invited to ${eventTitle}`}</Preview>
    <Body style={styles.body}>
      <Container style={styles.container}>
        <Heading style={styles.header}>You're Invited!</Heading>
        <Text style={styles.greeting}>Hi {inviteeName},</Text>
        <Text>
          You have been invited to attend <strong>{eventTitle}</strong> hosted
          by {userName}.
        </Text>
        <Hr />
        <Text>Here are the details:</Text>
        <ul>
          <li>
            <strong>Date:</strong> {eventDate}
          </li>
          <li>
            <strong>Time:</strong> {eventTime}
          </li>
          <li>
            <strong>Duration:</strong> {eventDuration} minutes
          </li>
        </ul>
        <Text>To confirm or view more details, please use the link below:</Text>
        <Button href={eventLink} style={styles.button}>
          Join Event
        </Button>
        <Button 
          href={generateGoogleCalendarLink({
            eventTitle,
            eventDate,
            eventTime,
            eventDuration,
            eventLink
          })} 
          style={styles.button}
        >
          Add to Calendar
        </Button>
        <Hr />
        <Text style={styles.footer}>
          If you have any questions, feel free to reply to this email.
        </Text>
        <Text style={styles.footer}>
          Looking forward to seeing you there!
          <br />
          The {appName} Team
        </Text>
      </Container>
    </Body>
  </Html>
);

const styles = {
  body: { fontFamily: "Arial, sans-serif", color: "#333", lineHeight: "1.5" },
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
  },
  header: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "10px",
    // textAlign: "center",
    borderRadius: "8px 8px 0 0",
  },
  greeting: { marginBottom: "15px" },
  button: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "10px 20px",
    textDecoration: "none",
    borderRadius: "5px",
    marginTop: "15px",
    display: "inline-block",
  },
  footer: {
    // textAlign: "center",
    fontSize: "12px",
    color: "#888",
    marginTop: "20px",
  },
};

export const generateGoogleCalendarLink = ({
  eventTitle,
  eventDate,
  eventTime,
  eventDuration,
  eventLink,
}: {
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventDuration: string;
  eventLink?: string;
}) => {
  const startDate = new Date(`${eventDate.split('/').reverse().join('-')} ${eventTime}`);
  const endDate = new Date(startDate.getTime() + parseInt(eventDuration) * 60000);
  console.log(startDate.toISOString(), endDate.toISOString());
  
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: eventTitle,
    dates: `${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    details: `Meeting Link: ${eventLink || 'Link will be provided'}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};