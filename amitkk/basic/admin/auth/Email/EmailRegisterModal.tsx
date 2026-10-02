"use client";

import React, { useEffect, useState } from "react";
import CustomModal from "@amitkk/basic/static/CustomModal";
import RegisterForm from "./RegisterForm";
import LoginForm from "./LoginForm";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import { Button } from "@amitkk/components/button/button";

export interface DataProps {
  role: string;
  attachUser?: boolean;
  saveUser?: boolean;
  onUpdate: () => void;
}

type DataFormProps = DataProps & {
  module: string;
  open: boolean;
};

const MODULE_TITLES: Record<string, string> = {
  "Register": "Create an Account",
  Login: "Welcome Back, Login",
  "Forgot Password": "Recover Your Account",
  "Reset Password": "Reset Your Password",
};

const MODULES: string[] = [
  "Register",
  "Login",
  "Forgot Password",
  "Reset Password",
];

export default function EmailRegisterModal({ module, role = "User", open, attachUser = false, saveUser = true, onUpdate }: DataFormProps) {
  const [moduleSelected, setModuleSelected] = useState<string>(module);

  useEffect(() => {
    setModuleSelected(module);
  }, [module]);

  return (
    <CustomModal open={open} handleClose={onUpdate} title={MODULE_TITLES[moduleSelected]} width="50">
      <div className="py-2">
        {moduleSelected === "Register" ? (
          <RegisterForm role={role} handleClose={onUpdate} attachUser={attachUser} saveUser={saveUser} onUpdate={onUpdate}/>
        ) : moduleSelected === "Login" ? (
          <LoginForm role={role} handleClose={onUpdate} attachUser={attachUser} saveUser={saveUser} onUpdate={onUpdate}/>
        ) : moduleSelected === "Forgot Password" ? (
          <ForgotPassword role="" handleClose={onUpdate} attachUser={attachUser} saveUser={saveUser} onUpdate={() => setModuleSelected("Reset Password")}/>
        ) : moduleSelected === "Reset Password" ? (
          <ResetPassword role="" handleClose={onUpdate} attachUser={attachUser} saveUser={saveUser} onUpdate={() => setModuleSelected("Login")}/>
        ) : null}
      </div>
      
      <div className="mt-6 text-center space-y-4 border-t pt-4">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {MODULES.map((m) => (
            <Button key={m} variant={m === moduleSelected ? "default" : "outline"} onClick={() => setModuleSelected(m)}>{m}</Button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground text-center">New to Misthir?{" "}
          <span onClick={() => setModuleSelected("Register")} className="cursor-pointer underline text-primary font-medium hover:text-primary/80 transition-colors">Create an Account</span>
        </p>
      </div>
    </CustomModal>
  );
}