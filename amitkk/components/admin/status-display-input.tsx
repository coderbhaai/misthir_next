"use client";

import React from "react";

import StatusSelect from "./status-input";
import DisplayOrder from "./display-order-input";

interface CombinedFieldProps {
  statusValue: boolean | null;

  displayOrderValue: number | null;

  onStatusChange: (value: boolean) => void;

  onDisplayOrderChange: (
    value: number | null
  ) => void;

  statusError?: boolean;

  displayOrderError?: boolean;
}

const StatusDisplay: React.FC<CombinedFieldProps> = ({
  statusValue,
  displayOrderValue,

  onStatusChange,
  onDisplayOrderChange,

  statusError,
  displayOrderError,
}) => {
  return (
    <div className="flex w-full flex-col gap-2 md:flex-row">
      <div className="flex-1">
        <StatusSelect value={statusValue} onChange={onStatusChange} error={statusError}/>
      </div>

      <div className="flex-1">
        <DisplayOrder value={displayOrderValue} onChange={onDisplayOrderChange} error={displayOrderError}/>
      </div>
    </div>
  );
};

export default StatusDisplay;