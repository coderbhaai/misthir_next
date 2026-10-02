"use client";

import { useState } from "react";
import { TableCell } from "@amitkk/components/basic/table";

type Props = {
  text?: string | null;
  maxLength?: number;
};

export function TruncatedTextCell({ text, maxLength = 50 }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!text) return <TableCell>-</TableCell>;

  const shouldTruncate = text.length > maxLength;
  const displayedText = isExpanded || !shouldTruncate 
    ? text 
    : `${text.substring(0, maxLength)}...`;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TableCell className="max-w-md break-all whitespace-pre-wrap">
      <div className="flex items-start justify-between gap-4">
        <span className="flex-1">{displayedText}</span>
        <button
          onClick={handleCopy}
          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 shrink-0"
          title="Copy text"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-blue-600 hover:underline mt-2 block"
        >
          {isExpanded ? "Show less" : "Show more"}
        </button>
      )}
    </TableCell>
  );
} 