// amitkk > components > layouts > AppLayout.tsx

import React from "react";
import { ThemeProvider } from "@mui/material";
import dynamic from 'next/dynamic';
import { SettingsProvider } from "../context/SettingsContext";
import Footer from "@amitkk/basic/static/Footer";
import Header from "@amitkk/basic/static/Header";
import theme from "@amitkk/basic/utils/theme";
const Toaster = dynamic(
  () => import('react-hot-toast').then((mod) => mod.Toaster),
  { ssr: false }
);
import Head from "next/head";

interface RootLayoutProps {
  children: React.ReactNode;
  meta?: {
    title?: string;
    description?: string;
  };
}

export default function AppLayout({ children, meta }: RootLayoutProps) {
  return (
    <>
      <Head>
        <title>{meta?.title || "Fallback Title"}</title>
        <meta name="description" content={meta?.description || "Fallback description"} />
      </Head>
      <ThemeProvider theme={theme}>
        <SettingsProvider>
          <Toaster position="top-center" />
          <Header />
          <main>{children}</main>
          <Footer />
        </SettingsProvider>
      </ThemeProvider>
    </>
  );
}
