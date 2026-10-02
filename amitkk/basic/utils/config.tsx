// amitkk/basic/utils/config.tsx

export const socialLinks = [
  { label: 'Facebook', href: 'https://www.facebook.com/raphaelhealthcaresolutions' },
    // { label: 'Instagram', href: 'https://instagram.com' },
    // { label: 'Twitter', href: 'https://twitter.com' },
    // { label: 'LinkedIn', href: 'https://linkedin.com' },
    // { label: 'YouTube', href: 'https://youtube.com' },
];

export const modules = [ "Blog", "Page", "Product", "ProductBrand", "ProductFeature", "Productmeta" ];

export const IMAGE_PRESETS = {
  hero: {
    sizes: "100vw",
    quality: 75,
  },
  card: {
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
    quality: 60,
  },
  thumbnail: {
    sizes: "120px",
    quality: 50,
  },
  logo: {
    maxWidth: "200px",
    maxHeight: "100px",
    sizes: "(max-width: 768px) 100vw, 200px",
    quality: 70,
  },
};

export const UI_STRINGS = {
  testimonial_title: "WHAT OUR USERS SAY ABOUT US",
  testimonial_text: "Trusted by visionary leaders & high-growth brands globally.",
  faq_title: "Get answers to common questions.",
  faq_text: "Frequently Asked Questions",
  service_title: "Our Services",
  service_text: "Explore our services.",
  technology_title: "Our Technology Stack",
  technology_text: "Explore Our Technology Stack.",
  blog_title: "Interesting Reads",
  blog_text: "Interesting Reads",
  contact_title: "Contact Us",
  contact_text: "Contact Us",
  achievement_title: "Our Achievements",
  achievement_text: "Some figures we achieved",
  product_title: "Our Products",
  product_text: "Our Products",
} as const;
