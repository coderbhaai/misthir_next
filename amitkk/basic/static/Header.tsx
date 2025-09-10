import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';
import { cn } from "@amitkk/basic/utils/utils";
import { Badge, Box, Button, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Sidebar } from '@amitkk/basic/static/Sidebar';
import TopBar from '@amitkk/basic/static/TopBar';
import { useAuth } from 'contexts/AuthContext';
import { getCookie } from 'hooks/CookieHook';
import MegaMenu from '@amitkk/basic/megaMenu';
import SearchBar from '@amitkk/basic/static/SearchBar';
import ContactModal from '@amitkk/basic/components/contact/ContactModal';
import { useEcom } from 'contexts/EcomContext';
import { ShoppingCart } from '@mui/icons-material';

interface CurrentUser {
  fullName: string;
  email: string;
  role: string;
}

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
];


export default function Header() {
  const [loggedIn, setLoggedIn] = useState(false);
  const authToken = getCookie("authToken");
  const { cartItemCount } = useEcom();

  useEffect(() => {
    setLoggedIn(!!authToken);
  }, [authToken]);
  
  const { onLogin, onLogout } = useAuth();
  useEffect(() => {
    const loginUnsubscribe = onLogin(() => {
      setLoggedIn(true);
    });

    const logoutUnsubscribe = onLogout(() => {
      setLoggedIn(false);
    });

    return () => {
      loginUnsubscribe();
      logoutUnsubscribe();
    };
  }, [onLogin, onLogout]);

  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const pathname = usePathname() || "";
  const [activePath, setActivePath] = useState(pathname || "");

  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  const loadUser = useCallback(() => {
    if ( getCookie("authToken") ) {
      setLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    loadUser();
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "currentUser") loadUser();
    };
    const handleAuthChange = () => loadUser();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [pathname, loadUser]);

  const commonNavLinks = navItems;
    const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <div className="relative border-b border-gray-200 text-[#1a1a1a] bg-white">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} navItems={commonNavLinks} loggedIn={loggedIn}/>
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)}/>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      <TopBar/>

      <div className="flex items-center  px-4 py-3">
          <Link href="/" passHref><Box component="img" src="/images/logo.svg" alt="AMITKK" sx={{ height: 40, width: 'auto', cursor: 'pointer'}}/></Link>
          <SearchBar/>
        <div className="flex items-center gap-2">
            <Button variant="contained" color="primary">Free Analysis</Button>
            <Button variant="outlined" color="primary" onClick={() => setContactOpen(true)}>Contact</Button>
            {cartItemCount > 0 && (
              <Link href="/cart" passHref>
                <IconButton color="inherit">
                  <Badge
                    badgeContent={cartItemCount}
                    color="error"
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: '0.75rem',
                        minWidth: 24,
                        height: 24,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      },
                    }}
                  >
                    <ShoppingCart />
                  </Badge>
                </IconButton>
              </Link>
            )}

            <IconButton onClick={() => setSidebarOpen(true)} aria-label="Open menu" sx={{ color: '#1a1a1a', fontSize: '1.5rem', padding: '8px' }}>
              <MenuIcon fontSize="inherit" />
            </IconButton>
        </div>
      </div>

      <nav className="hidden md:flex items-center justify-center relative">
        {navItems.map((item) => {
          const isActive =
            activePath === item.to ||
            (item.to !== "/" && activePath.startsWith(item.to));

          return (
            <Box
              key={item.label}
              sx={{ position: "relative", px: 2 }}
              onMouseEnter={() => item.label === "Hotels" && setOpenMenu("Hotels")}
              onMouseLeave={() => item.label === "Hotels" && setOpenMenu(null)}
            >
              <Link
                href={item.to}
                className={cn(
                  "text-sm font-medium px-2 py-1 rounded-sm transition-colors",
                  isActive
                    ? "text-[#005aa7] border-b-2 border-[#005aa7]"
                    : "text-[#1a1a1a] hover:text-transparent hover:bg-gradient-to-br hover:from-[#031f2d] hover:via-[#0c4d52] hover:to-[#155e63] hover:bg-clip-text"
                )}
              >
                {item.label}
              </Link>
            </Box>
          );
        })}        
        {openMenu === "Hotels" && <MegaMenu />}
      </nav>
    </div>
  );
}
