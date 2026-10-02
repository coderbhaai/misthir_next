"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Briefcase, X, CodeXml } from "lucide-react";

import MenuLink from "./MenuLink";
import LogOut from "./LogOut";
import { MenuItem } from "contexts/MenuContext";

import { useAuth } from "contexts/AuthContext";
import { getCookie } from "hooks/CookieHook";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: MenuItem[];
}

export default function Sidebar({ isOpen, onClose, navItems }: SidebarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openSubDropdown, setOpenSubDropdown] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  const { onLogin, onLogout } = useAuth();

  useEffect(() => {
    setLoggedIn(Boolean(getCookie("authToken")));

    const unsubLogin = onLogin(() => setLoggedIn(true));
    const unsubLogout = onLogout(() => setLoggedIn(false));

    return () => {
      unsubLogin();
      unsubLogout();
    };
  }, [onLogin, onLogout]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/50 transition-opacity animate-in fade-in-0" onClick={onClose} aria-hidden="true"/>
      <aside className={`fixed top-0 right-0 h-full w-[90vw] md:w-[600px] bg-white z-[100] transition-transform duration-300 overflow-y-auto ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Link href="/" onClick={onClose}><img src="/images/logo.svg" alt="Logo" className="h-10 w-auto"/></Link>
          <button type="button" onClick={onClose} className="p-2 cursor-pointer" aria-label="Close Sidebar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = item.Icon || Briefcase;
              const dropdown = item.dropdown;
              const isDropdownOpen = openDropdown === item.label;

              return (
                <div key={item.label} className="w-full">
                  {dropdown ? (
                    <button type="button" onClick={() => setOpenDropdown(isDropdownOpen ? null : item.label)} className="w-full font-medium flex items-center justify-between px-3 py-2.5 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5"/>
                        <span>{item.label}</span>
                      </div>
                      {isDropdownOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  ) : (
                    <Link href={item.to || "#"} onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                      <Icon className="h-5 w-5"/><span>{item.label}</span>
                    </Link>
                  )}

                  {dropdown && isDropdownOpen && (
                    <div className="pl-6 pt-1 space-y-1">
                      {dropdown.kind === "grouped" &&
                        dropdown?.groups?.map((group) => {
                          const isSubOpen = openSubDropdown === group.type;
                          return (
                            <div key={group.type}>
                              <button type="button" onClick={() => setOpenSubDropdown(isSubOpen ? null : group.type)} className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-semibold text-foreground hover:bg-accent transition-colors">
                                <span>{group.type}</span>
                                {isSubOpen ? ( 
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </button>

                              {isSubOpen && (
                                <div className="pl-4 pt-1 space-y-1">
                                  {group.items.map((sub) => (
                                    <Link key={sub.label} href={sub.to} onClick={onClose} className="block px-3 py-1.5 rounded-md text-xs hover:text-primary hover:bg-accent transition-colors">{sub.label}</Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}

                      {dropdown.kind === "flat" &&
                        dropdown?.items?.map((sub) => (
                          <Link key={sub.label} href={sub.to} onClick={onClose} className="block px-3 py-2 rounded-md text-xs hover:text-primary hover:bg-accent transition-colors">{sub.label}</Link>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {loggedIn && ( <MenuLink/> )}
        </div>
        
        <div className="p-4 border-t border-border">
          <LogOut variant="drawer" />
        </div>
      </aside>
    </div>
  );
}