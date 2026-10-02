import { useState } from "react";
import EmailRegisterModal from "../admin/auth/Email/EmailRegisterModal";
import { Button } from "@amitkk/components/button/button";

interface LoginButtonProps {
  message: string;
}

export const LoginButton: React.FC<LoginButtonProps> = ({ message }) => {
  const [authModal, setAuthModal] = useState({ open: false, type: 'Login' });
  const handleAuthClick = (type: 'Login' | 'Register') => {
    setAuthModal({ open: true, type });
  };
  return (
    <>
      <div className="text-center my-5 p: 3, border-2">
        <h3>{message}</h3>
          <Button onClick={() => handleAuthClick("Login")} color="primary">Login</Button>
      </div>

      <EmailRegisterModal module={authModal.type} open={authModal.open} role="User" onUpdate={() => { setAuthModal({...authModal, open: false}); }}/>
    </>
  );
}
