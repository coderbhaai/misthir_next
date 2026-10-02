"use client";

import { apiRequest } from "@amitkk/basic/utils/my-utils/admin-utils";
import { createContext, useContext, ReactNode, useEffect, useState, ElementType } from "react";
import { CodeXml, Cpu, StarX } from "lucide-react";

export interface MenuLinkItem {
  label: string;
  to: string;
}

export interface MenuGroup {
  type: string;
  items: MenuLinkItem[];
}

export type MenuDropdown = 
  | { kind: "grouped"; groups: MenuGroup[]; }
  | { kind: "flat"; items: MenuLinkItem[]; };

export interface MenuItem {
  label: string;
  to: string;
  Icon?: ElementType;
  dropdown?: MenuDropdown;
  originalUrl?: string;
}

interface MenuContextType {
  menus: MenuItem[];
  extraMenus: MenuItem[];
  loading: boolean;
}

const MenuContext = createContext<MenuContextType>({
  menus: [],
  extraMenus: [],
  loading: true,
});

export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [extraMenus, setExtraMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMenus() {
      try {
        setLoading(true);
        const res = await apiRequest("GET", `basic/menu?function=get_menu_links`);
        const data = res?.data;

        if (!data) {
          setMenus([]);
          setExtraMenus([]);
          return;
        }

        const pages = data?.pages || [];
        const getPage = (url: string) => pages.find((page: any) => page.originalUrl === url);

        // const technologyPage = getPage("our-technology");
        // const servicesPage = getPage("our-services");
        // const portfolioPage = getPage("our-portfolio");

        // const technologyMenu: MenuItem = {
        //   label: technologyPage?.name || "Technology",
        //   to: technologyPage?.url ? `/${technologyPage.url}` : "/our-technology",
        //   Icon: Cpu,
        //   originalUrl: "our-technology",
        //   dropdown: {
        //     kind: "flat",
        //     items: (data?.technologies || []).map((t: any) => ({
        //       label: t.name,
        //       to: `/${t.url}`,
        //     })),
        //   },
        // };

        // const servicesMenu: MenuItem = {
        //   label: servicesPage?.name || "Services",
        //   to: servicesPage?.url ? `/${servicesPage.url}` : "/our-services",
        //   Icon: CodeXml,
        //   originalUrl: "our-services",
        //   dropdown: {
        //     kind: "grouped",
        //     groups: (data?.service_types || []).map((serviceType: any) => ({
        //       type: serviceType.name,
        //       items: (serviceType.services || []).map((service: any) => ({
        //         label: service.service_id?.name ?? "",
        //         to: `/${service.service_id?.url ?? ""}`,
        //       })),
        //     })),
        //   },
        // };

        // const portfolioMenu: MenuItem = {
        //   label: portfolioPage?.name || "Portfolio",
        //   to: portfolioPage?.url ? `/${portfolioPage.url}` : "/our-portfolio",
        //   Icon: StarX,
        //   originalUrl: "our-portfolio",
        //   dropdown: {
        //     kind: "flat",
        //     items: (data?.portfolios || []).map((p: any) => ({
        //       label: p.name,
        //       to: `/${p.url}`,
        //     })),
        //   },
        // };

        const staticMenus: MenuItem[] = [
          { label: "Shop", to: "/shop" },
          { label: "Blogs", to: "/blogs" },
          { label: "Contact Us", to: "/contact-us" },
        ];

        const resolvedExtraMenus: MenuItem[] = [
          { label: "About Us", to: "/about-us" },
          { label: "Sitemap", to: "/sitemap" },
          { label: "Privacy Policy", to: "/privacy-policy" },
          { label: "Terms & Conditions", to: "/terms-and-conditions" },
        ];

        setMenus([ ...staticMenus, ]);

        setExtraMenus(resolvedExtraMenus);
      } catch (error) {
        console.error("Failed to load menus", error);
        setMenus([]);
        setExtraMenus([]);
      } finally {
        setLoading(false);
      }
    }

    loadMenus();

    const handleStorageChange = () => loadMenus();
  }, []);

  return (
    <MenuContext.Provider value={{ menus, extraMenus, loading }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => useContext(MenuContext);