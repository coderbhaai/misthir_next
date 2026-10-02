import React from "react";
import Link from "next/link";

export interface AdminModulePillProps<T> {
  items?: T[] | null;
  getId: (item: T) => string | number;
  getName: (item: T) => string | null | undefined;
  getUrl?: (item: T) => string | null | undefined;
  getBasePath?: string | ((item: T) => string | null | undefined); // 👈 Allow string or function
  label?: string;
  className?: string;
}

const AdminModulePill = <T,>({
  items, 
  getId, 
  getName, 
  getUrl, 
  getBasePath = "/", // 👈 Default to "/"
  label, 
  className, 
}: AdminModulePillProps<T>) => {
  if (!items?.length) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 mb-3 ${className ?? ""}`}>
      {label && ( <span className="font-semibold mr-1 text-sm">{label}</span> )}
      
      {items.map((item) => {
        if (!item) return null;

        const id = getId(item);
        const name = getName(item) ?? "-";
        const url = getUrl?.(item);
        
        // Resolve basePath whether it's passed as a string or a function
        const resolvedBasePath = typeof getBasePath === "function" ? getBasePath(item) : getBasePath;
        const href = url && resolvedBasePath !== undefined 
          ? `${resolvedBasePath ? resolvedBasePath : ""}/${url}`.replace(/\/\/+/g, "/") 
          : null;

        const pillClass = "inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border transition-colors duration-200 " +
          (href ? "bg-blue-600 text-white border-blue-600 hover:bg-white hover:text-blue-600" : "bg-blue-600 text-white border-blue-600");

        if (href) {
          return (
            <Link key={id} href={href} target="_blank" rel="noopener noreferrer" className={pillClass}>{name}</Link>
          );
        }
        return (
          <span key={id} className={pillClass}>{name}</span>
        );
      })}
    </div>
  );
};

export default AdminModulePill;