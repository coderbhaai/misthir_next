// pages > index.tsx

import HomeSlider from "@amitkk/basic/components/HomeSlider";
import { Box } from "@mui/material";
import Achievement from "@amitkk/basic/components/Achievement";
import AutoSlider from "@amitkk/basic/components/AutoSlider";
import ServicesSlider from "@amitkk/basic/components/ServicesSlider";
import Portfolio from "@amitkk/basic/components/Portfolio";
import MobileSecond from "@amitkk/basic/components/MobileSecond";
import Admin from "@amitkk/basic/components/admin";
import { apiRequest } from "@amitkk/basic/utils/utils";
import { FaqProps } from "@amitkk/basic/types/page";
import FaqPanel from "@amitkk/basic/components/faq/FaqPanel";

interface HomePageProps {
  meta: {
    title: string;
    description: string;
  };
  faq: FaqProps[];
  testimonials: any[];
}

export default function HomePage({ meta, faq, testimonials }: HomePageProps) {
  return (
    <Box>
      <HomeSlider />
      <AutoSlider />
      <Achievement />
      <ServicesSlider />
      <MobileSecond />
      <Portfolio />
      <Admin />
      <FaqPanel faq={faq}/>
    </Box>
  );
}

export async function getServerSideProps() {
  const res = await apiRequest("get", `basic/page?function=get_page_data&url=/&module=Page`);
  const meta = res?.data?.meta || { title: process.env.NEXT_PUBLIC_DEFAULT_TITLE, description: process.env.NEXT_PUBLIC_DEFAULT_DESCRIPTION };
  const faq = res?.data?.faq || [];
  const testimonials = res?.data?.testimonials || [];

  return { props: { meta, faq, testimonials } };
}