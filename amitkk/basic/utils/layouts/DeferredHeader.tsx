import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Header = dynamic( () => import("@amitkk/basic/static/Header"), { ssr: false });

export default function DeferredHeader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timer: any;

    const run = () => {
      timer = setTimeout(() => {
        setShow(true);
      }, 1200);
    };

    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(run);
    } else {
      run();
    }

    return () => clearTimeout(timer);
  }, []);

  if (!show) {
    return (
      <div className="h-[72px] md:h-[96px]" />
    );
  }

  return <Header />;
}