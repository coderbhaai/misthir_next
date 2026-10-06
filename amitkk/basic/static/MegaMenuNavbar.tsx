"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ShoppingCart, Menu } from "lucide-react";
import dynamic from "next/dynamic";
import { useMenu, MenuGroup } from "contexts/MenuContext";
import { useEcom } from "contexts/EcomContext";
import { useAuth } from "contexts/AuthContext";
import { useWishlist } from "contexts/WishlistContext";
import { Button } from "@amitkk/components/button/button";
import { Badge } from "@amitkk/components/ui/badge";
import { Heart } from 'lucide-react';
const Sidebar = dynamic(() => import("./Sidebar"), { ssr: false });

export default function MegaMenuNavbar() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const { cartItemCount } = useEcom();
  const { wishlistCount } = useWishlist();
  const { isLoggedIn, hasRole, user } = useAuth();
  const { menus } = useMenu();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsSticky(window.scrollY > 150);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const splitIntoColumns = <T,>(items: T[], columnCount = 5): T[][] => {
    const columns: T[][] = Array.from({ length: columnCount }, () => []);
    items?.forEach((item, index) => {
      columns[index % columnCount].push(item);
    });
    return columns;
  };

  return (
    <header className={`w-full z-50 transition-all duration-200 ${ isSticky ? "fixed top-0 left-0 right-0 shadow-md animate-in slide-in-from-top-2" : "relative" }`}>
      <nav className="flex items-center justify-between bg-[#f7f7f7] shadow-xl px-3 md:px-5">
        <Link href="/" className="py-3"><img src="/images/logo.svg" alt="Logo" className="w-[70px] h-auto" /></Link>
        <div className="hidden md:flex items-center gap-6 mx-auto h-full">
          {menus?.map((menu) => {
            const dropdown = menu.dropdown;

            return (
              <div key={menu.label} className="relative h-full" onMouseEnter={() => setActiveMenu(menu.label)} onMouseLeave={() => setActiveMenu(null)}>
                <Link href={menu.to} className="text-sm font-bold uppercase px-3 py-5 inline-block text-foreground hover:text-primary transition-colors">{menu.label}</Link>
                {activeMenu === menu.label && dropdown && (
                  <>
                    {dropdown.kind === "grouped" && (
                      <div className="fixed left-0 right-0 bg-white border-t border-border shadow-xl z-50 animate-in fade-in-50 zoom-in-95">
                        <div className="max-w-7xl mx-auto px-8 py-8">
                          <div className="grid grid-cols-5 gap-10">
                            {splitIntoColumns<MenuGroup>(dropdown.groups).map(
                              (column, colIndex) => (
                                <div key={colIndex} className="space-y-8">
                                  {column.map((group) => (
                                    <div key={group.type}>
                                      <p className="text-sm font-semibold text-primary mb-3">{group.type}</p>
                                      <ul className="space-y-2">
                                        {group.items.map((item) => (
                                          <li key={item.label}><Link href={item.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">{item.label}</Link></li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {dropdown.kind === "flat" && (
                      <div className="absolute top-full left-0 bg-white shadow-xl border border-border rounded-md z-50 min-w-[220px] animate-in fade-in-50 zoom-in-95">
                        <ul className="py-3 px-4 space-y-3">
                          {dropdown.items.map((item) => (
                            <li key={item.label}><Link href={item.to} className="block text-sm text-muted-foreground hover:text-primary transition-colors">{item.label}</Link></li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-3">

        {wishlistCount > 0 && ( 
          <Link href="/my-wishlist" passHref>
            <Button variant="ghost" size="icon" className="relative rounded-full"aria-label="Wishlist">
              <Heart className="h-5 w-5" />
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full">{wishlistCount}</Badge>
            </Button>
          </Link>
        )}

          {mounted && cartItemCount > 0 && (
            <Link href="/cart" className="relative p-1.5 rounded-md hover:bg-white/10 transition-colors shrink-0">
              <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-white text-primary rounded-full h-4 w-4 flex items-center justify-center">{cartItemCount}</span>
                <ShoppingCart className="h-5 w-5 md:h-6 md:w-6 transition-colors duration-300" />
            </Link>
          )}
          {isLoggedIn && user?.name && (
              <span className="hidden md:block text-xs md:text-sm font-semibold truncate max-w-[100px] lg:max-w-[140px]">{user.name}</span>
          )}

          <button type="button" onClick={() => setSidebarOpen(true)} aria-label="Open Menu" className="cursor-pointer">
            <Menu className="h-6 w-6" />
          </button>
        </div>
        
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} navItems={menus}/>
      </nav>
    </header>
  );
}