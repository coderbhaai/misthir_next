import React from "react";
import Link from "next/link";

interface CellLinkProps {
  title?: string;
  url?: string;
  prefix?: string;
  className?: string;
  target?: string;
}

export const CellLink: React.FC<CellLinkProps> = ({ title, url, prefix = "/", className = "", target = "_blank", }) => {
  if (!title) return null;

  const cleanPrefix = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
  const cleanUrl = url ? (url.startsWith("/") ? url : `/${url}`) : "";
  const fullPath = url ? `${cleanPrefix}${cleanUrl}` : null;

  return (
    <div className={`flex flex-col ${className}`}>
      <span className="font-medium text-gray-900">{title}</span>

      {fullPath ? (
        <Link href={fullPath} target={target} className="text-xs text-blue-600 hover:text-blue-800 hover:underline break-all">{url}</Link>
      ) : null}
    </div>
  );
};