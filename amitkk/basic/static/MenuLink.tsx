"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "contexts/AuthContext";
import { getLayoutLinks } from "../utils/my-utils/shared-utils";

interface MenuItemProps {
  _id: string;
  name: string;
  url?: string;
  media_id?: { path?: string } | null;
  media?: string | null;
  children?: MenuItemProps[];
}

export default function MenuLink({ collapsed = false }: { collapsed?: boolean }) {
  const [menu, setMenu] = useState<MenuItemProps[]>([]);
  const [userLinks, setUserLinks] = useState<MenuItemProps[]>([]);
  const [sellerLinks, setSellerLinks] = useState<MenuItemProps[]>([]);
  const [openMap, setOpenMap] = useState<{ [key: string]: boolean }>({});
  const { onLogin, onLogout } = useAuth();

  useEffect(() => {
    async function fetchMenu() {
      const data = await getLayoutLinks();

      const mapMenu = (items: MenuItemProps[] = []): MenuItemProps[] => {
        return items.map((item) => ({
          ...item,
          media: item.media_id?.path || null,
          children: mapMenu(item.children || []),
        }));
      };

      // Helper to flatten children if parent nodes shouldn't be displayed
      const extractChildrenOnly = (items: MenuItemProps[] = []): MenuItemProps[] => {
        let extracted: MenuItemProps[] = [];
        items.forEach((item) => {
          if (item.children && item.children.length > 0) {
            extracted = extracted.concat(mapMenu(item.children));
          }
        });
        return extracted;
      };

      setMenu(mapMenu(data.adminLinks));
      setUserLinks(extractChildrenOnly(data.userSubmenus));
      setSellerLinks(extractChildrenOnly(data.sellerSubmenus));
    }

    fetchMenu();

    const unsubscribeLogin = onLogin(() => fetchMenu());
    const unsubscribeLogout = onLogout(() => {
      setMenu([]);
      setUserLinks([]);
      setSellerLinks([]);
      setOpenMap({});
    });

    return () => {
      unsubscribeLogin();
      unsubscribeLogout();
    };
  }, []);

  const toggleMenu = (id: string) => {
    setOpenMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderMenuContent = (item: MenuItemProps) => (
    <>
      {item.media && !collapsed && (
        <img src={item.media} alt={item.name} className="h-5 w-5 rounded-full object-cover" loading="lazy" />
      )}
      <span>{item.name}</span>
    </>
  );

  const renderItems = (items: MenuItemProps[] = [], depth = 0) => {
    return items.map((item) => {
      const hasChildren = item.children && item.children.length > 0;
      const isOpen = openMap[item._id];
      const paddingLeft = depth * 16 + 12;

      return (
        <div key={item._id} className="px-2">
          {hasChildren ? (
            <>
              <button
                onClick={() => toggleMenu(item._id)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left"
                style={{ paddingLeft }}
              >
                <div className="flex items-center gap-2">{renderMenuContent(item)}</div>
                {!collapsed && <span>{isOpen ? "-" : "+"}</span>}
              </button>

              {isOpen && <div className="mt-1">{renderItems(item.children, depth + 1)}</div>}
            </>
          ) : (
            <Link
              href={item.url || "#"}
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ paddingLeft }}
            >
              {renderMenuContent(item)}
            </Link>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-1">
      {/* Admin Links */}
      {renderItems(menu)}

      {/* Divider or separation if needed */}
      {userLinks.length > 0 && <hr className="my-2 border-white/10" />}

      {/* User Submenus (Flattened children only, skipping parent wrapper) */}
      {userLinks.map((item) => (
        <div key={item._id} className="px-2">
          <Link href={item.url || "#"} className="flex items-center gap-2 rounded-lg px-3 py-2">
            {renderMenuContent(item)}
          </Link>
        </div>
      ))}

      {sellerLinks.length > 0 && <hr className="my-2 border-white/10" />}

      {/* Seller Submenus (Flattened children only, skipping parent wrapper) */}
      {sellerLinks.map((item) => (
        <div key={item._id} className="px-2">
          <Link href={item.url || "#"} className="flex items-center gap-2 rounded-lg px-3 py-2">
            {renderMenuContent(item)}
          </Link>
        </div>
      ))}
    </div>
  );
}