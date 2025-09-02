import { Box, Button, Grid, List, Typography } from "@mui/material";
import { Login as LoginIcon, PersonAdd as PersonAddIcon, Logout as LogoutIcon, } from "@mui/icons-material";
import RegisterModal from "../components/auth/RegisterModal";
import { useAuth } from "contexts/AuthContext";
import { hitToastr } from "../utils/utils";
import { useState, useEffect } from "react";
import router from "next/router";

export default function LogOut() {
  const { logout, isLoggedIn } = useAuth();
  const handleLogout = () => {
    logout();
    hitToastr('success', "GoodBye");
    router.push("/")
  };

  const [authModal, setAuthModal] = useState({ open: false, type: 'login' });
    const handleAuthClick = (type: 'login' | 'signup') => {
      setAuthModal({ open: true, type });
    };
  
    useEffect(() => {
      if (isLoggedIn) {
        setAuthModal(prev => ({ ...prev, open: false }));
      }
    }, [isLoggedIn]); 

  return(
    <>
      <Box sx={{ borderTop: "1px solid #e0e0e0", pt: 2 }}>
          {isLoggedIn ? (
            <Button fullWidth variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={handleLogout}>Log out</Button>
          ) : (
            <List>
              <Button fullWidth startIcon={<LoginIcon />} onClick={() => handleAuthClick('login')} sx={{ justifyContent: 'flex-start' }}>Log In</Button>
              <Button fullWidth startIcon={<PersonAddIcon />} onClick={() => handleAuthClick('signup')} sx={{ justifyContent: 'flex-start', mt: 1 }}>Sign Up</Button>
            </List>
          )}
      </Box>

      <RegisterModal open={authModal.open} title={authModal.type === 'login' ? 'Login' : 'Sign Up'} role="User" onUpdate={() => { setAuthModal({...authModal, open: false}); }}/>
    </>
  );
}