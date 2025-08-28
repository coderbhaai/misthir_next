import ContactForm from "@amitkk/basic/components/contact/ContactForm";
import SuggestBlogs from "@amitkk/blog/static/suggest-blog";
import { Container, Typography } from "@mui/material";

export default function FourOFour() {
  return (
    <>
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4" gutterBottom>404 !!! Something bad happened</Typography>
      </Container>
      <SuggestBlogs/>
    </>
  );
}
