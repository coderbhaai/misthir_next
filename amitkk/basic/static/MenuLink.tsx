"use client";

import Link from "next/link";
import {useEffect, useState } from "react";
import { useAuth } from "contexts/AuthContext";
import { getLayoutLinks } from "../utils/my-utils/shared-utils";

interface MenuItemProps {
  _id: string;
  name: string;
  url?: string;
  media_id?: {path?: string;} | null;
  media?: string | null;
  children?: MenuItemProps[];
}

export default function MenuLink({collapsed = false}: {collapsed?: boolean;}) {
  const [menu, setMenu] = useState<MenuItemProps[]>([]);
  const [userLinks, setUserLinks] = useState<MenuItemProps[]>([]);
  const [openMap, setOpenMap] = useState<{[key: string]: boolean}>({});
  const {onLogin, onLogout} = useAuth();

  useEffect(() => {
    async function fetchMenu() {
      const data = await getLayoutLinks();

      const mapMenu = (items: MenuItemProps[] = []): MenuItemProps[] => {
        return items.map(
          (item) => ({
            ...item,
            media: item.media_id?.path || null,
            children: mapMenu(item.children || []),
          })
        );
      };

      setMenu(mapMenu(data.adminLinks));
      setUserLinks(mapMenu(data.userSubmenus));
    }

    fetchMenu();

    const unsubscribeLogin = onLogin(() => fetchMenu());
    const unsubscribeLogout = onLogout(() => {
      setMenu([]);
      setUserLinks([]);
      setOpenMap({});
    });

    return () => {
      unsubscribeLogin();
      unsubscribeLogout();
    };
  }, []);

  const toggleMenu = (id: string) => { setOpenMap((prev) => ({...prev, [id]: !prev[id]})); };

  const renderItems = (items: MenuItemProps[] = [], depth = 0) => {
    return items.map((item) => {
      const hasChildren = item.children && item.children.length > 0;
      const isOpen = openMap[item._id];

      return (
        <div key={item._id} className="px-2">
          {hasChildren ? (
            <>
              <button onClick={() => toggleMenu(item._id)} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left" style={{paddingLeft: depth * 16 + 12}}>
                <div className="flex items-center gap-2">{renderMenuContent(item)}</div>

                {!collapsed && (<span>{isOpen ? "-" : "+"}</span>)}
              </button>

              {isOpen && ( <div className="mt-1">{renderItems(item.children, depth + 1)}</div> )}
            </>
          ) : (
            <Link href={item.url || "#"} className="flex items-center gap-2 rounded-lg px-3 py-2" style={{paddingLeft: depth * 16 + 12}}>{renderMenuContent(item)}</Link>
          )}
        </div>
      );
    });
  };

  const renderMenuContent = (item: MenuItemProps) => (
    <>
      {item.media && !collapsed && (
        <img src={item.media} alt={item.name} className="h-5 w-5 rounded-full object-cover" loading="lazy"/>
      )}
      <span>{item.name}</span>
    </>
  );

  return (
    <div className="space-y-1">
      {renderItems(menu)}

      {userLinks.map((item) => (
        <Link key={item._id} href={item.url || "#"} className="flex items-center gap-2 rounded-lg px-3 py-2">{renderMenuContent(item)}</Link>
      ))}
    </div>
  );
}