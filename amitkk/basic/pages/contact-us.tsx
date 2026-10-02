"use client";

import ContactForm from "@amitkk/basic/admin/contact/ContactForm";
import { Phone, Mail, Globe } from "lucide-react";

export default function ContactUs() {

  return (
    <div className="container py-5 md:py-12">
      <h1 className="text-center text-2xl font-bold md:text-4xl text-[#003500]">Contact Us</h1>
      <p className="mt-2 text-center text-sm md:text-base leading-relaxed">We're here to guide you every step of your medical journey — from consultation to recovery, with care and compassion.</p>

      <div className="row my-5">
        <div className="col-span-12 md:col-span-7">
          <div className="rounded-xl bg-white p-6 md:p-10 shadow">
            <ContactForm handleClose={() => {}} />
          </div>
        </div>
        <div className="col-span-12 md:col-span-5">
          <div className="h-full rounded-xl bg-[#003500] p-6 md:p-8 text-white flex flex-col justify-center">
            
            <h2 className="text-lg font-medium mb-4">Hi! We are always here to help you.</h2>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
                <Phone size={18} />
                <a href="tel:+919311924733" className="text-sm">+91 9311924733</a>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
                <Mail size={18} />
                <span className="text-sm">amit@amitkk.com</span>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
                <Globe size={18} />
                <a href="https://www.amitkk.ae" target="_blank" className="text-sm">www.amitkk.ae</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}