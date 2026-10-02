import React from "react";
import { OptionProps } from "@amitkk/basic/types/generic";

interface RelationCellWithNameProps {
  value?: string | OptionProps | null;
  rawValue?: string | null;
  field?: string;
  label?: string;
  separator?: React.ReactNode;
}

function isOptionProps(obj: any): obj is OptionProps {
  return obj && typeof obj === "object" && typeof obj._id === "string";
}

const RelationCellWithName: React.FC<RelationCellWithNameProps> = ({
  value,
  rawValue,
  field = "name",
  label,
  separator = <br />,
}) => {
  const displayLabel = label ?? field;

  if (isOptionProps(value)) {
    const finalValue =
      field !== "name"
        ? (value as any)?.[field] ?? value.name
        : value.name;

    return (
      <>
        <span
          style={{
            display: "inline-block",
            padding: "4px 12px",
            border : "1px solid #1976d2",
            borderRadius: "16px",
            backgroundColor: "#1976d2", // blue bg
            color: "#fff", // white text
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: 500,
            transition: "all 0.2s ease",
          }}
        >{displayLabel}
        </span>
        : {finalValue}
        {separator}
      </>
    );
  }

  const normalizedRaw = rawValue && rawValue.trim() !== "" && rawValue !== "0" ? rawValue.trim() : "";

  if (normalizedRaw) {
    return (
      <>
        <strong>{displayLabel}:</strong> {rawValue}
        {separator}<br/>
      </>
    );
  }
  return <><strong>{displayLabel}:</strong> Not Found<br/></>;
};

export default RelationCellWithName;
