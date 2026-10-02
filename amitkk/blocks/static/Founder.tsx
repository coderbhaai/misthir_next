import { Card } from "@amitkk/components/ui/card";
import Image from "next/image";

export default function Founder() {
  return (
    <div className="py-10">
      <div className="container mx-auto px-4">
        <div className="row items-center">
          <div className="md:col-span-5 flex justify-center">
            <Image src="/images/admin/amit.png" alt="amitkk" width={300} height={300}/>
          </div>
          <div className="md:col-span-7 space-y-4">
            <Card className="p-4 text-center text-xl font-semibold">AMIT KUMAR KHARE</Card>
            <p className="text-sm leading-relaxed text-muted-foreground text-center">Amit Kumar Khare, the visionary founder of AmitKK...</p>
            <p className="text-sm leading-relaxed text-muted-foreground text-center">His journey spans Air Force, Thomas Cook India, and digital entrepreneurship.</p>
          </div>
        </div>
      </div>
    </div>
  );
}