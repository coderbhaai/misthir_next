import dynamic from "next/dynamic";
const TopBar = dynamic(() => import("@amitkk/basic/static/TopBar"), {ssr: false});
const MegaMenuNavbar = dynamic(() => import("@amitkk/basic/static/MegaMenuNavbar"), {ssr: false});

export default function Header() {
  return (
    <header className="sticky top-0 z-[1200] w-full bg-white">
      <TopBar />
      <MegaMenuNavbar />
    </header>
  );
}