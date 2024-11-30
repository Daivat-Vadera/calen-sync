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

export const UserConfirmationEmail = ({
  userName,
  eventTitle,
  eventDate,
  eventTime,
  eventDuration,
  eventLink,
  appName,
  userEventLink,
}: {
  userName: string | null;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventDuration: string;
  eventLink: string | undefined;
  appName: string;
  userEventLink: string | undefined;
}) => (
  <Html>
    <Head />
    <Preview>{`Confirmation for ${eventTitle}`}</Preview>
    <Body style={styles.body}>
      <Container style={styles.container}>
        <Heading style={styles.header}>Event Confirmation</Heading>
        <Text style={styles.greeting}>Hi {userName},</Text>
        <Text>
          Your event <strong>{eventTitle}</strong> has been successfully
          scheduled.
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
        <Text>You can manage your event using the link below:</Text>
        <Button href={userEventLink} style={styles.button}>
          Manage Event
        </Button>
        <Button href={eventLink} style={styles.button}>
          Join Event
        </Button>
        <Hr />
        <Text style={styles.footer}>
          Thank you,
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
