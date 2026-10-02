"use client";

import { useState } from "react";
import { Checkbox } from "@amitkk/components/basic/checkbox";
import { cn } from "@amitkk/lib/utils";

export interface TreeItem {
  _id: string;
  name: string;
  parent_id?: string | null;
  children?: TreeItem[];
}

interface FilterTreeProps {
  label?: string;
  items: TreeItem[];
  selected: string[];
  onChange: (values: string[], lastSelected?: string) => void;
  checkboxClassName?: string;
  className?: string;
}

export function FilterTree({ label, items, selected, onChange, className, checkboxClassName="data-checked:bg-black data-checked:border-black data-checked:text-white" }: FilterTreeProps) {
  const getId = (id: string) => String(id);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const handleToggle = (id: string) => {
    const isSelected = selected.includes(id);

    let newSelected: string[];
    if (isSelected) {
      newSelected = selected.filter((s) => s !== id);
    } else {
      newSelected = [...selected, id];
    }

    onChange(newSelected, id);
  };

  const handleToggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const hasSelectedDescendant = (node: TreeItem): boolean => {
    if (!node.children || node.children.length === 0) return false;

    return node.children.some((child) => {
      const childId = getId(child._id);
      return (
        selected.includes(childId) || hasSelectedDescendant(child)
      );
    });
  };

  const renderNodes = (nodes: TreeItem[], level = 0) => {
    return nodes.map((node) => {
      const nodeId = getId(node._id);
      const isSelected = selected.includes(nodeId);
      const shouldExpand = isSelected || hasSelectedDescendant(node) || expandedIds[nodeId];

      return (
        <div key={nodeId} className="mb-1">
          <div className="flex items-center gap-2 py-1">
            <Checkbox id={nodeId} checked={isSelected} onCheckedChange={() => handleToggle(nodeId)} className={checkboxClassName}/>
            <span 
              onClick={() => handleToggleExpand(nodeId)} 
              className={`text-sm cursor-pointer select-none ${isSelected ? "font-semibold text-foreground" : "text-muted-foreground"}`}
            >
              {node.name}
            </span>
          </div>

          {shouldExpand && node.children && node.children.length > 0 && (
            <div className="ml-5">
              {renderNodes(node.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className={cn("py-3", className)}>
      {label && (
        <>
          <h3 className="text-lg font-semibold mb-1">{label}</h3>
          <div className="border-b border-border mb-2" />
        </>
      )}

      {items?.length ? (
        renderNodes(items)
      ) : (
        <p className="text-sm text-muted-foreground">No options available</p>
      )}
    </div>
  );
}