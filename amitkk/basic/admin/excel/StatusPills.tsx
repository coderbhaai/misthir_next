// StatusPills.tsx
import React from "react";

export interface StatusPillsData {
  batch_no: string;
  createdAt: Date | string;
  total_rows?: number;
  success_count?: number;
  failed_count?: number;
}

interface StatusPillsProps {
  data?: StatusPillsData;
  className?: string;
}

const StatusPills: React.FC<StatusPillsProps> = ({ data, className }) => {
  if (!data) return null; // nothing to render yet

  const total = data.total_rows ?? 0;
  const success = data.success_count ?? 0;
  const failed = data.failed_count ?? 0;
  const pending = Math.max(total - (success + failed), 0);

  return (
    <div className={`flex flex-wrap gap-2 items-center ${className || ""}`}>
      <span className="px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
        🗂 Batch: {data.batch_no}
      </span>
      <span className="px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
        📅 Created: {new Date(data.createdAt).toLocaleString()}
      </span>
      <span className="px-4 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium flex items-center gap-1">
        ✅ Success: {success}
      </span>
      <span className="px-4 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium flex items-center gap-1">
        ❌ Failed: {failed}
      </span>
      <span className="px-4 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium flex items-center gap-1">
        ⏳ Pending: {pending}
      </span>
    </div>
  );
};


export default StatusPills;
