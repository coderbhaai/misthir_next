// layouts/AppLayout.tsx

import { useEffect, useState } from "react";
import SeoHead from "@amitkk/seo/admin/SeoHead";
import StaticHeader from "@amitkk/basic/static/StaticHeader";
import dynamic from "next/dynamic";
import Providers from "contexts/Providers";
import { Toaster } from "react-hot-toast";
const Header = dynamic(() => import("@amitkk/basic/static/Header"), { ssr: false });
const Footer = dynamic(() => import("@amitkk/basic/static/Footer"), { ssr: false });
const MobileFooter = dynamic(() => import("@amitkk/basic/static/MobileFooter"), { ssr: false });

export default function AppLayout({children, meta}: {children: React.ReactNode; meta?: any; }) {
  const [enhanced, setEnhanced] = useState(false);

  useEffect(() => {
    let timer: any;

    const run = () => { timer = setTimeout(() => { setEnhanced(true); }, 1200); };
    if ("requestIdleCallback" in window) { (window as any).requestIdleCallback(run); } else { run(); }
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <Providers>
      <SeoHead meta={meta}/>
      {enhanced ? <Header/> : <StaticHeader/>}
      <Toaster position="top-center"/>
      <main>{children}</main>
      <Footer />
      <MobileFooter/>
    </Providers>
  );
}