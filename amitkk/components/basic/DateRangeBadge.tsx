import React from "react"; 
import DateTimeFormat from "../admin/date-format";

interface DateRangeDisplayProps {
    validFrom: string | Date;
    validTo: string | Date;
    className?: string;
}

export const DateRangeDisplay: React.FC<DateRangeDisplayProps> = ({ 
    validFrom, 
    validTo, 
    className = "text-xs text-gray-600 space-y-0.5" 
}) => {
    if (!validFrom && !validTo) {
        return <span className="text-gray-400 text-xs italic">No validity set</span>;
    }

    return (
        <div className={className}>
            <div className="flex items-center gap-1.5">
                <span className="font-medium text-gray-400 uppercase tracking-wider text-[10px]">From:</span>
                <span className="font-medium text-gray-800">
                    {validFrom ? <DateTimeFormat value={validFrom} /> : "—"}
                </span>
            </div>
            <div className="flex items-center gap-1.5">
                <span className="font-medium text-gray-400 uppercase tracking-wider text-[10px]">To:</span>
                <span className="font-medium text-gray-800">
                    {validTo ? <DateTimeFormat value={validTo} /> : "—"}
                </span>
            </div>
        </div>
    );
};