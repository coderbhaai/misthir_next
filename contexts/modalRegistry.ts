import dynamic from "next/dynamic";

export const MODAL_COMPONENTS = {
  contact: { title: "Contact Us", component: dynamic(() => import("@amitkk/basic/admin/contact/ContactForm"), { ssr: false }) },
  lead: { title: "Get A Quote", component: dynamic(() => import("@amitkk/basic/admin/lead/LeadForm"), { ssr: false }) },
};

export type ModalType = keyof typeof MODAL_COMPONENTS;