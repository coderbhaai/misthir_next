import ContactForm from "@amitkk/basic/components/contact/ContactForm";
import { Container, Typography } from "@mui/material";

export default function ContactUs() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>Contact Us</Typography>
      <Typography variant="body1">We'd love to hear from you. Please fill out the form below or email us at contact@example.com.</Typography>

      <ContactForm handleClose={()=> {}}/>

    </Container>
  );
}
