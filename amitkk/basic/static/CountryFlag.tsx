import React from "react";

interface CountryFlagProps {
  flag: string | undefined;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function CountryFlag({
  flag,
  className,
  style,
}: CountryFlagProps) {
  if (!flag) return null;

  return (
    <span
      className={`flag-wrapper ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: flag }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    />
  );
}
