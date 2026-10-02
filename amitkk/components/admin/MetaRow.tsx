import { ArrayProps } from "@amitkk/basic/types";
import { GenericPills } from "./generic-pills";

type MetaRowItem = ArrayProps;

interface MetaRowProps {
  label: string;
  items?: MetaRowItem[] | null;
  basePath?: string;
  clickable?: boolean;
}

export function MetaRow({ label, items, basePath, clickable = true }: MetaRowProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="flex">
      <span className="mr-3">{label}:</span>
      <GenericPills items={items} basePath={basePath} clickable={clickable}/>
    </div>
  );
}
