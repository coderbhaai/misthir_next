// TopBar.tsx

import SocialMedia from "./SocialMedia";
import { Phone } from "lucide-react";

interface TopBarProps {
  bg?: string;
}

export default function TopBar({ bg = "#f5f5f5"}: TopBarProps) {
  const isDarkBg = bg === "#061b5a";
  const iconColor = isDarkBg ? "#ffffff" : "#14213d";
  const hoverColor = isDarkBg ? "#ffb703" : "#ff4081";

  return (
    <div className="flex items-center justify-end px-3 py-2">
      <a href="tel:+919311924733" className="flex items-center gap-1 text-sm font-medium mr-5">
        <Phone className="h-3.5 w-3.5 text-black" />
        <span style={{ color: "#000" }}>+91 93119 24733</span>
      </a>
      <SocialMedia/>
    </div>
  );
}