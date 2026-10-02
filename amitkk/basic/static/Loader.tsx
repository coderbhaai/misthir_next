import Image from "next/image";

export default function Loader() {
  return (
    <div className="fixed inset-0 z-[2000] flex h-screen w-screen items-center justify-center bg-white">
      <Image src="/images/logo.svg" alt="Loading..." width={160} height={160} priority className="animate-pulse"/>
    </div>
  );
}