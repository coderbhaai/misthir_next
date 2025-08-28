"use client";
import Link from "next/link";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Divider, Typography, Box, Button, } from "@mui/material";
import { Home as HomeIcon, Hotel as HotelIcon, Flight as FlightIcon, Apartment as ApartmentIcon, Map as MapIcon, Diamond as DiamondIcon, Support as SupportIcon, Work as WorkIcon, Login as LoginIcon, PersonAdd as PersonAddIcon, Logout as LogoutIcon, } from "@mui/icons-material";
import { useEffect, useState } from "react";
import RegisterModal from "@amitkk/basic/components/auth/RegisterModal";
import { useAuth } from "contexts/AuthContext";
import { hitToastr } from "@amitkk/basic/utils/utils";

interface NavItem {
  label: string;
  to: string;
  icon?: React.ElementType;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  loggedIn: boolean;
  navItems: NavItem[];
}

const iconMap: { [key: string]: React.ElementType } = {
  Home: HomeIcon,
  Hotels: HotelIcon,
  Flights: FlightIcon,
  Airbnb: ApartmentIcon,
  "Tours & Cruises": MapIcon,
  "Ultra Lux": DiamondIcon,
  Inspiration: SupportIcon,
};

export function Sidebar({ isOpen, onClose, navItems, loggedIn }: SidebarProps) {
  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
    hitToastr('success', "GoodBye");
  };

  const [authModal, setAuthModal] = useState({ open: false, type: 'login' });
  const handleAuthClick = (type: 'login' | 'signup') => {
    setAuthModal({ open: true, type });
  };

  useEffect(() => {
    if (loggedIn) {
      setAuthModal(prev => ({ ...prev, open: false }));
    }
  }, [loggedIn]);
  
  const NavLink = ({ href, label, Icon, }: { href: string; label: string; Icon?: React.ElementType; }) => (
    <Link href={href} passHref>
      <ListItem disablePadding>
        <ListItemButton onClick={onClose}>
          {Icon && ( <ListItemIcon><Icon /></ListItemIcon> )}
          <ListItemText primary={label} />
        </ListItemButton>
      </ListItem>
    </Link>
  );

  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose}>
      <Box sx={{ width: 280, display: "flex", flexDirection: "column", height: "100%" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2, borderBottom: "1px solid #e0e0e0" }}>
          <Link href="/" passHref> <Box component="img" src="/images/logo.svg" alt="AMITKK" sx={{ height: 40, width: 'auto', cursor: 'pointer'}}/></Link>
        </Box>
        
        <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
          <List>
            {navItems?.map((item) => (
              <NavLink key={item.to} href={item.to} label={item.label} Icon={iconMap[item.label] || WorkIcon}/>
            ))}
          </List>

          {loggedIn && (
            <>
              <Divider sx={{ my: 1 }} />
              <List>
                {/* {userSpecificLinks?.map((link) => (
                  <NavLink key={link.to} href={link.to} label={link.label} Icon={link.icon} />
                ))} */}
              </List>
            </>
          )}
        </Box>

        <Box sx={{ borderTop: "1px solid #e0e0e0", p: 2 }}>
          {loggedIn ? (
            <Button fullWidth variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={handleLogout}>Log out</Button>
          ) : (
            <List>
              <Button fullWidth startIcon={<LoginIcon />} onClick={() => handleAuthClick('login')} sx={{ justifyContent: 'flex-start' }}>Log In</Button>
              <Button fullWidth startIcon={<PersonAddIcon />} onClick={() => handleAuthClick('signup')} sx={{ justifyContent: 'flex-start', mt: 1 }}>Sign Up</Button>
            </List>
          )}
        </Box>
      </Box>

      <RegisterModal open={authModal.open} title={authModal.type === 'login' ? 'Login' : 'Sign Up'} role="User" onUpdate={() => { setAuthModal({...authModal, open: false}); }}/>
    </Drawer>
  );
}
