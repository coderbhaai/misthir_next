import { Box, Button, Grid, List, Typography } from "@mui/material";
import { Login as LoginIcon, PersonAdd as PersonAddIcon, Logout as LogoutIcon, } from "@mui/icons-material";
import MobileRegisterModal from "@amitkk/basic/components/auth/Mobile/MobileRegisterModal";
import { useAuth } from "contexts/AuthContext";
import { hitToastr } from "../utils/utils";
import { useState, useEffect } from "react";
import router from "next/router";
import EmailRegisterModal from "../components/auth/Email/EmailRegisterModal";

export default function LogOut() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  
  const { logout, isLoggedIn } = useAuth();
  const handleLogout = () => {
    logout();
    hitToastr('success', "GoodBye");
    router.push("/")
  };

  const [authModal, setAuthModal] = useState({ open: false, type: 'Login' });
  const handleAuthClick = (type: 'Login' | 'Register') => {
    setAuthModal({ open: true, type });
  };

  useEffect(() => {
    if (isLoggedIn) {
      setAuthModal(prev => ({ ...prev, open: false }));
    }
  }, [isLoggedIn]); 

  if (!mounted) return null;

  return(
    <>
      <Box sx={{ borderTop: "1px solid #e0e0e0", pt: 2 }}>
          {isLoggedIn ? (
            <Button fullWidth variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={handleLogout}>Log out</Button>
          ) : (
            <List>
              <Button fullWidth startIcon={<LoginIcon />} onClick={() => handleAuthClick('Login')} sx={{ justifyContent: 'flex-start' }}>Log In</Button>
              <Button fullWidth startIcon={<PersonAddIcon />} onClick={() => handleAuthClick('Register')} sx={{ justifyContent: 'flex-start', mt: 1 }}>Sign Up</Button>
            </List>
          )}
      </Box>

      <MobileRegisterModal open={authModal.open} title={authModal.type === 'Login' ? 'Login' : 'Sign Up'} role="User" onUpdate={() => { setAuthModal({...authModal, open: false}); }}/>

      {/* <EmailRegisterModal module={authModal.type} open={authModal.open} role="User" onUpdate={() => { setAuthModal({...authModal, open: false}); }}/> */}
    </>
  );
}