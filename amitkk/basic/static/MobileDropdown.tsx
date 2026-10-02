// components/MobileDropdown.tsx

import Image from "next/image";
import Link from "next/link";

type FlatItem = {
  label: string;
  to: string;
};

type GroupItem = {
  type: string;
  items: FlatItem[];
};

type DropdownData =
  | { 
      kind: "grouped";
      groups: GroupItem[];
    }
  | { 
      kind: "flat";
      items: FlatItem[];
    };

type Props = {
  dropdown: DropdownData;
  openSubDropdown: string | null;
  setOpenSubDropdown: (value: string | null) => void;
  setIsOpen: (value: boolean) => void;
};

export default function MobileDropdown({dropdown, openSubDropdown, setOpenSubDropdown, setIsOpen}: Props) {
  return (
    <div className="pb-4 pl-6">
      {dropdown.kind === "grouped" && dropdown.groups.map((group) => (
          <div key={group.type} className="mb-4">
            <button aria-label="Close DropDown" onClick={() => setOpenSubDropdown(openSubDropdown === group.type ? null : group.type)} className="flex w-full items-center justify-between py-2">
              <span className="font-semibold text-primary">{group.type}</span>
              <Image src="/images/icons/static/down.svg" alt="Expand" width={14} height={14} className={`transition-transform duration-200 ${openSubDropdown === group.type ? "rotate-180" : ""}`}/>
            </button>

            {openSubDropdown === group.type && (
              <div className="pl-3 pt-2">
                {group.items.map((sub) => (
                  <Link key={sub.label} href={sub.to} onClick={() => setIsOpen(false)} className="block py-1 text-sm text-gray-700 transition-colors hover:text-primary">{sub.label}</Link>
                ))}
              </div>
            )}
          </div>
        ))}
        
      {dropdown.kind === "flat" && dropdown.items.map((sub) => (
          <Link key={sub.label} href={sub.to} onClick={() => setIsOpen(false)} className="block py-2 text-sm text-gray-700 transition-colors hover:text-primary">{sub.label}</Link>
        ))}
    </div>
  );
}