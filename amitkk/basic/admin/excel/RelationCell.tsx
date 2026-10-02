import { OptionProps } from "@amitkk/basic/types/generic";
import React from "react";

interface RelationCellProps {
  value: string | OptionProps | null | undefined;
  fallback?: string;
  field?: keyof OptionProps;
}

// Type guard
function isOptionProps(obj: any): obj is OptionProps {
  return obj && typeof obj === "object" && typeof obj._id === "string";
}

const RelationCell: React.FC<RelationCellProps> = ({
  value,
  fallback = "—",
  field = "name",
}) => {

  if (!value) return <>{fallback}</>;

  // Populated case
  if (isOptionProps(value)) {
    return <>{value[field] ?? fallback}</>;
  }

  // Non-populated (ObjectId or raw string)
  return <>{fallback}</>;
};

export default RelationCell;
