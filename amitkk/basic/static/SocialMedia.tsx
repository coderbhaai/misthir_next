import { socialLinks } from "@amitkk/basic/utils/config";
import { Stack, Box, Button, Typography } from "@mui/material";
import Link from "next/link";
import { linkButtonStyles } from "pages/sitemap";

export default function SocialMedia() {
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="left" alignItems="center">
      {socialLinks?.map((item, index) => (
        <Box key={`${item.href}-social-${index}`} sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <Button variant="text" href={item.href} component={Link} target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined} sx={linkButtonStyles}>{item.label}</Button>
          {index !== socialLinks.length - 1 && ( <Typography sx={{ mx: 2, userSelect: 'none', lineHeight: 1, fontSize: 28 }}>|</Typography>)}
        </Box>
      ))}
  </Stack>
  );
}