"use client";

import { useState, useEffect, ReactNode } from "react";
import Head from "next/head";
import { Toaster } from "react-hot-toast";
import MenuLink from "@amitkk/basic/static/MenuLink";
import LogOut from "@amitkk/basic/static/LogOut";
import AdminProviders from "contexts/AdminProviders";
import Header from "@amitkk/basic/static/Header";

export const SIDEBAR_COOKIE_KEY = "sidebar_state";

export function getSidebarState(): "expanded" | "collapsed" {
  if (typeof document === "undefined") return "expanded";

  return (
    (document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${SIDEBAR_COOKIE_KEY}=`))
      ?.split("=")[1] as "expanded" | "collapsed") || "expanded"
  );
}

export function setSidebarState(state: "expanded" | "collapsed") {
  document.cookie = `${SIDEBAR_COOKIE_KEY}=${state}; path=/; max-age=31536000`;
}

const EXPANDED_WIDTH = 280;
const COLLAPSED_WIDTH = 100;

interface AdminLayoutProps {
  children: ReactNode;
}

const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function AdminLayout({children}: AdminLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    setMounted(true);

    setCollapsed(
      getSidebarState() === "collapsed"
    );
  }, []);

  const toggleSidebar = () => {
    const next = !collapsed;

    setCollapsed(next);
    setSidebarState(next ? "collapsed" : "expanded");
  };
  
  const sidebarWidth = collapsed && !hovered ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  if (!mounted) return null;

  return (
    <AdminProviders>
      <Head>
        <title>AMITKK</title>
        <meta name="description" content="AMITKK"/>
        <meta name="robots" content="noindex, nofollow"/>
        <link rel="icon" href="/images/icons/static/favicon.png"/>
      </Head>

      <Toaster position="top-center"/>

      <div className="flex">
        <aside onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className="fixed left-0 top-0 z-[1200] flex h-[calc(100vh-50px)] flex-col border-r border-gray-200 bg-primary text-white transition-all duration-300" style={{width: sidebarWidth}}>
          <div className="flex items-center px-3 py-2">
            <button onClick={toggleSidebar} className="rounded-md p-2 text-white transition hover:bg-white/10">{collapsed ? ( <MenuIcon /> ) : ( <CloseIcon /> )}</button>
          </div>

          <div className="flex-1 overflow-y-auto p-2" style={{scrollbarWidth: "none", msOverflowStyle: "none"}}>
            <MenuLink collapsed={collapsed && !hovered}/>
          </div>

          <div className="p-2">
            <LogOut collapsed={collapsed && !hovered}/>
          </div>
        </aside>

        <main className="flex-1 transition-all duration-300" style={{marginLeft: sidebarWidth, width: `calc(100% - ${sidebarWidth}px)`}}>
          <Header/>
          
          <div className="p-5">
            {children}
          </div>
        </main>
      </div>
    </AdminProviders>
  );
}