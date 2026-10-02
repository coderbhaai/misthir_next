"use client";

import Image from "next/image";

import {
  Heart,
  Handshake,
  Globe,
  Hospital,
} from "lucide-react";
import { Card, CardContent } from "@amitkk/components/ui/card";

export default function AboutUs() {
  return (
    <div className="bg-slate-100">
      <div className="py-12 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="rounded-xl overflow-hidden shadow">
              <Image src="/images/static/about-01.jpg" alt="AMITKK" width={600} height={400} className="w-full h-auto" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl md:text-4xl font-semibold text-[#003500] mb-10">Why Choose AMITKK?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: <Hospital className="h-10 w-10 text-[#003500]" />, title: "World-Class Care", desc: "Leading hospitals and doctors at affordable cost." },
              { icon: <Handshake className="h-10 w-10 text-[#003500]" />, title: "Seamless Experience", desc: "End-to-end support from consultation to recovery." },
              { icon: <Globe className="h-10 w-10 text-[#003500]" />, title: "Global Expertise", desc: "Specialists across all major disciplines." },
              { icon: <Heart className="h-10 w-10 text-[#003500]" />, title: "Transparent Care", desc: "Clear communication and honest pricing." },
            ].map((item, i) => (
              <Card key={i} className="text-center p-4 shadow rounded-xl">
                <CardContent className="space-y-2">
                  {item.icon}
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}

          </div>

        </div>
      </div>
    </div>
  );
}