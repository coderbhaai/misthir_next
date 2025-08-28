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
  const [submenuOpen, setSubmenuOpen] = useState<{ [key: string]: boolean }>({});
  const [menu, setMenu] = useState<any[]>([]);

  useEffect(() => {
    async function fetchMenu() {
      const data = await getLayoutLinks();
      setMenu(data);
    }
    fetchMenu();
  }, []);

  const handleSubmenuToggle = (name: string) => {
    setSubmenuOpen((prev) => ({ ...prev, [name]: !prev[name] }));
  };

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
          
          <Main open={open} >
            <Grid container spacing={4} sx={{ py:4, width:"100vw",mx:"auto"}} gap={0} >
              <Grid size={3}>
                  <List>
                    {menu?.map((item) => (
                      <div key={item.name}>
                        <ListItem disablePadding>
                          <ListItemButton onClick={() => item.children && handleSubmenuToggle(item.name)}>
                            {item.media && (
                              <img src={item.media} alt={item.name} style={{ width: 20, height: 20, objectFit: "cover", borderRadius: "50%", marginRight: 8, }}/>
                            )}
                            {open && <ListItemText primary={item.name} />}
                            {open && item.children && (submenuOpen[item.name] ? <ExpandLess /> : <ExpandMore />)}
                          </ListItemButton>
                        </ListItem>
                      
                          {item.children && open && (
                            <Collapse in={submenuOpen[item.name]} timeout="auto" unmountOnExit>
                              <List component="div" disablePadding>
                                {item.children?.map((child: { name: string; url?: string, media?:string }) => (
                                  <List key={`${item.name}-${child.url || child.name}`}>
                                    <ListItem component="a" href={child.url} sx={{ pl: 4 }}>
                                      {child.media && (
                                        <img src={child.media} alt={child.name} style={{ width: 20, height: 20, objectFit: "cover", borderRadius: "50%", marginRight: 8, }}/>
                                      )}
                                      <ListItemText primary={child.name} />
                                    </ListItem>
                                  </List>
                                ))}
                              </List>
                            </Collapse>
                          )}
                      </div>
                    ))}
                  </List>
              </Grid>
              <Grid size={9}>
                {children}
              </Grid>
            </Grid>
          </Main>
        </Box>
      </SettingsProvider>
    </ThemeProvider>
  );
}