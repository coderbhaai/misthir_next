"use client";
import Link from "next/link";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Divider, Box } from "@mui/material";
import MenuLink from "./MenuLink";
import LogOut from "./LogOut";
import { Work as WorkIcon } from "@mui/icons-material";

interface NavItem {
  label: string;
  to: string;
  Icon?: React.ElementType;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  loggedIn: boolean;
  navItems: NavItem[];
}

export function Sidebar({ isOpen, onClose, navItems, loggedIn }: SidebarProps) {
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
            {navItems?.map((item) => {
              const Icon = item.Icon;
              return ( <NavLink key={item.to} href={item.to} label={item.label} Icon={Icon || WorkIcon}/>);
            })}
          </List>
          
          {loggedIn && (
            <>
              <Divider sx={{ my: 1 }} />
              <MenuLink/>
            </>
          )}
        </Box>
        <LogOut/>
      </Box>
    </Drawer>
  );
}
