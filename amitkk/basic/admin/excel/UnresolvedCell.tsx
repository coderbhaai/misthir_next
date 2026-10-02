import React from "react";

export type UnresolvedItem = {
  field: string;
  value: any;
};

type UnresolvedCellProps = {
  data?: UnresolvedItem[] | null;
  emptyText?: string;
};

const UnresolvedCell: React.FC<UnresolvedCellProps> = ({data, emptyText = "-" }) => {
  if (!data || data.length === 0) { return <>{emptyText}</>; }

  return (
    <div>
      {data.map((item, index) => (
        <div key={index}><strong>{item.field}:</strong> {String(item.value)}</div>
      ))}
    </div>
  );
};

export default UnresolvedCell;