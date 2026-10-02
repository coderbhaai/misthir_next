"use client";

import { useState, useEffect } from "react";
import { LogIn, UserPlus, LogOut as LogOutIcon } from "lucide-react";

import { useAuth } from "contexts/AuthContext";
import EmailRegisterModal from "../admin/auth/Email/EmailRegisterModal";
import { hitToastr } from "../utils/my-utils/admin-utils";
import { Button } from "@amitkk/components/button/button";
import { cn } from "@amitkk/lib/utils";

interface LogOutProps {
  collapsed?: boolean;
  variant?: "sidebar-dark" | "sidebar-light" | "drawer";
}

const variantStyles = {
  "sidebar-dark": {
    buttonClass: "border-white/20 text-white hover:bg-white/10 hover:text-white hover:border-white",
    textClass: "text-white",
    iconClass: "text-white",
  },
  "sidebar-light": {
    buttonClass: "border-[#005aa7] text-[#005aa7] hover:bg-[#005aa7]/10 hover:text-[#005aa7] hover:border-[#005aa7]",
    textClass: "text-[#005aa7]",
    iconClass: "text-[#005aa7]",
  },
  drawer: {
    buttonClass: "border-border text-foreground hover:bg-accent hover:text-accent-foreground",
    textClass: "text-foreground",
    iconClass: "text-primary",
  },
};

export default function LogOut({collapsed = false, variant = "sidebar-dark"}: LogOutProps) {
  const styles = variantStyles[variant];

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { logout, isLoggedIn } = useAuth();

  const handleLogout = () => {
    logout();
    hitToastr("success", "GoodBye");
    window.location.href = "/";
  };

  const [authModal, setAuthModal] = useState({
    open: false,
    type: "Login" as "Login" | "Register",
  });

  if (!mounted) return null;

  return (
    <>
      <div className="border-t border-border pt-4">
        {isLoggedIn ? (
          <Button variant="outline" className={cn("w-full justify-center gap-2", styles.buttonClass)} onClick={handleLogout}>
            <LogOutIcon className={cn("h-4 w-4", styles.iconClass)} />
            {!collapsed && <span>Log out</span>}
          </Button>
        ) : (
          <div className="flex justify-between">
            <Button variant="ghost" className={cn("justify-start gap-2 text-sm font-medium", styles.textClass)} onClick={() => setAuthModal({ open: true, type: "Login" })}>
              <LogIn className={cn("h-4 w-4", styles.iconClass)} />
              <span>Log In</span>
            </Button>

            <Button variant="ghost" className={cn("justify-start gap-2 text-sm font-medium", styles.textClass)} onClick={() => setAuthModal({ open: true, type: "Register" })}>
              <UserPlus className={cn("h-4 w-4", styles.iconClass)} />
              <span>Sign Up</span>
            </Button>
          </div>
        )}
      </div>

      <EmailRegisterModal module={authModal.type} open={authModal.open} role="User" onUpdate={() => setAuthModal({ ...authModal, open: false })}/>
    </>
  );
}