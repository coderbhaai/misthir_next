"use client";

import { useState, ReactNode, useEffect } from "react";
import { AppBar, Toolbar, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Collapse, IconButton, Box, Typography, ThemeProvider,
  Grid } from "@mui/material";
import { Home, Settings, ExpandLess, ExpandMore, Menu, Search } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from "react-hot-toast";
import Link from 'next/link';
import Footer from "@amitkk/basic/static/Footer";
import TopBar from "@amitkk/basic/static/TopBar";
import { getLayoutLinks } from "@amitkk/basic/utils/utils";
import { SettingsProvider } from "@amitkk/basic/utils/context/SettingsContext";
import theme from "@amitkk/basic/utils/theme";
import MenuLink from "@amitkk/basic/static/MenuLink";
import LogOut from "@amitkk/basic/static/LogOut";

const drawerWidth = 0;
const collapsedWidth = 70;

const Main = styled("main")<{ open: boolean }>(({ theme, open }) => ({
  flexGrow: 1,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: open ? `${drawerWidth}px` : `${collapsedWidth}px`,
  width: `calc(100% - ${open ? drawerWidth : collapsedWidth}px)`,
  // padding: theme.spacing(3),
  padding: 0,
  marginTop: '95px', // Match AppBar height
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    marginTop: '95px', // Match AppBar height
    height: 'calc(100vh - 95px)', // Full height minus AppBar
    position: 'fixed',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
}));

interface SidebarLayoutProps {
  children: ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const [open, setOpen] = useState(true);
  
  const handleSidebarToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <SettingsProvider>
        <Toaster position='top-center' />
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />
          <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: "white", boxShadow: "none", height: '95px'}}>
            <TopBar/>
            <Toolbar>
              <IconButton edge="start" sx={{ mr: 2, color: "black" }} onClick={handleSidebarToggle}>
                <Menu/>
              </IconButton>
              <Link href="/" passHref> <Box component="img" src="/images/logo.svg" alt="AMITKK" sx={{ height: 40, width: 'auto', cursor: 'pointer'}}/></Link>
              <Search/>
            </Toolbar>
          </AppBar>
          <Main open={open}>
            <Grid container spacing={4} sx={{ py: 4, width: "100vw", mx: "auto" }} gap={0}>
              <Grid size={3} sx={{ position: "fixed", top: "95px", left: 0, bottom: 0, display: "flex", flexDirection: "column", width: "25%", borderRight: "1px solid #e0e0e0", bgcolor: "background.paper", zIndex: 1200 }}>
                <Box sx={{ flex: 1, overflowY: "auto", pb: 8 }}><MenuLink /></Box>
                <Box sx={{ position: "sticky", bottom: 0, bgcolor: "background.paper", p: 2, }}><LogOut /></Box>
              </Grid>
              <Grid size={9} sx={{ ml: "25%" }}>
                {children}
              </Grid>
            </Grid>
          </Main>
        </Box>
      </SettingsProvider>
    </ThemeProvider>
  );
}