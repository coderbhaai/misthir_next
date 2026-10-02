import React from "react";
import { TextField } from "@amitkk/components/basic/TextField";
import { Checkbox } from "@amitkk/components/basic/checkbox";
import { Label } from "@amitkk/components/basic/label";

interface ContactInfoSectionProps {
  email?: string;
  setEmail?: (val: string) => void;
  phone?: string;
  setPhone?: (val: string) => void;
  emailConsent?: boolean;
  setEmailConsent?: (val: boolean) => void;
  phoneConsent?: boolean;
  setPhoneConsent?: (val: boolean) => void;
  editable?: boolean;
  onBlur?: () => void;
}

export default function ContactInfoSection({
  email = "",
  setEmail,
  phone = "",
  setPhone,
  emailConsent = false,
  setEmailConsent,
  phoneConsent = false,
  setPhoneConsent,
  editable = true,
  onBlur,
}: ContactInfoSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <TextField type="email" label="Email" value={email} name="email" onChange={(e) => setEmail?.(e.target.value)} required={editable} disabled={!editable} onBlur={onBlur}/>
        <div className="flex items-center space-x-2 cursor-pointer">
          <Checkbox id="email-news" checked={Boolean(emailConsent)} disabled={!editable} onCheckedChange={(checked) => setEmailConsent?.(Boolean(checked))}/>
          <Label htmlFor="email-news" className="text-sm font-normal">Email me with news and offers</Label>
        </div>
      </div>

      <div className="space-y-1.5">
        <TextField label="Phone" value={phone} name="phone" onChange={(e) => setPhone?.(e.target.value)} required={editable} disabled={!editable} onBlur={onBlur}/>
        <div className="flex items-center space-x-2 cursor-pointer">
          <Checkbox id="whatsapp-news" checked={Boolean(phoneConsent)} disabled={!editable} onCheckedChange={(checked) => setPhoneConsent?.(Boolean(checked))}/>
          <Label htmlFor="whatsapp-news" className="text-sm font-normal">Whatsapp me with news and offers</Label>
        </div>
      </div>
    </div>
  );
}