import ContactForm from "@amitkk/basic/components/contact/ContactForm";
import SuggestBlogs from "@amitkk/blog/static/suggest-blog";
import { Container, Typography } from "@mui/material";

export default function ContactUs() {
  return (
    <>
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4" gutterBottom>Thank you for connecting with Us</Typography>
      </Container>
      <SuggestBlogs/>
    </>
  );
}
