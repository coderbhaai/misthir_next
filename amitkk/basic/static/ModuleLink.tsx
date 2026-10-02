import Link from "next/link";
import * as React from "react";


interface ModuleLinkProps {
  module?: string;
  module_url?: string;
  module_name?: string;
}

const ModuleLink: React.FC<ModuleLinkProps> = ({ module, module_url, module_name }) => {
  if (!module_name) return null;

  if (!module_url) return <>{module_name}</>;

  let href = "#";
  switch (module) {
    case "Blog":
    case "Page":
      href = `/${module_url}`;
      break;
    case "Service":
      href = `/${module_url}`;
      break;
    default:
      href =  `/${module_url}`;
  }

  return (
    <Link href={href} target="_blank" rel="noopener noreferrer">{module_name}</Link>
  );
};

export default ModuleLink;
