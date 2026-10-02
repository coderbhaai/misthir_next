"use client";

import { useState, useMemo, useEffect } from "react";
import { useMenu } from "contexts/MenuContext";
import SimpleDisplayItem from "@amitkk/components/ui/SimpleDisplayItem";

type TabType = "Services" | "General" | null;

export default function MobileFooter() {
  const { menus } = useMenu();

  const [activeTab, setActiveTab] = useState<TabType>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    document.body.style.overflow = activeTab ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [activeTab]);

  const getItems = (label: string) => {
    const menu = menus.find((m) => m.label === label);
    if (!menu?.dropdown) return [];

    if (menu.dropdown.kind === "flat") return menu.dropdown.items;
    if (menu.dropdown.kind === "grouped") return menu.dropdown.groups.flatMap((g) => g.items);
    return [];
  };

  const items = useMemo(() => {
    if (!activeTab) return [];

    return getItems(activeTab).filter((i: any) => i.image).filter((i: any) => i.label.toLowerCase().includes(search.toLowerCase()));
  }, [activeTab, search, menus]);

  const closePanel = () => {
    setActiveTab(null);
    setSearch("");
  };

  return (
    <div className="md:hidden">
      <div className="fixed bottom-0 left-0 z-[1400] flex w-full items-center justify-around border-t bg-white py-2 shadow-lg">
        <FooterButton label="Services" icon="/images/icons/static/map.svg" active={activeTab === "Services"} onClick={() => setActiveTab("Services")} />
        <FooterButton label="General" icon="/images/icons/static/menu-box.svg" active={activeTab === "General"} onClick={() => setActiveTab("General")} />
      </div>

      {activeTab && <div onClick={closePanel} className="fixed inset-0 z-[1250] bg-black/70" />}
      <div className={`fixed bottom-12 left-0 z-[1300] flex h-[70vh] w-full flex-col rounded-t-3xl bg-white transition-transform duration-300 ${activeTab ? "translate-y-0" : "translate-y-full"}`}>
        <div className="sticky top-0 z-10 border-b bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{activeTab}</h2>
            <button onClick={closePanel} aria-label="Close panel" className="rounded-full p-2 transition hover:bg-gray-100">✕</button>
          </div>
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-primary"/>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-4">
            {items.map((item: any, index: number) => (
              <SimpleDisplayItem key={index} name={item.label} url={item.to} image={item.image} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FooterButton({label, icon, active, onClick}: { label: string; icon: string; active: boolean; onClick: () => void; }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center transition-all ${active ? "text-primary" : "text-gray-500"}`}>
      <img src={icon} alt={label} className="mb-1 h-6 w-6" loading="lazy" />
      <span className={`text-xs ${active ? "font-semibold" : ""}`}>{label}</span>
    </button>
  );
}