// components/ContentRenderer.tsx
import React, { useState } from "react";

interface ContentRendererProps {
  content: string;
  className?: string;
  maxHeight?: number;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({ content, className = "", maxHeight }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasHeightLimit = maxHeight !== undefined;
  const isClamped = hasHeightLimit && !isExpanded;

  return (
    <div className="flex flex-col items-start w-full">
      <div className="relative w-full">
        <div className={`content overflow-hidden ${className}`} style={{ maxHeight: isClamped ? `${maxHeight}px` : "none", }} dangerouslySetInnerHTML={{ __html: content }}/>
        {isClamped && (
          <div className="absolute bottom-0 left-0 w-full h-12 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0))' }}/>
        )}
      </div>

      {hasHeightLimit && (
        <button onClick={() => setIsExpanded(!isExpanded)} className="mt-1 text-xs font-semibold text-[#ad2e24] hover:text-[#8b1f18] transition-colors focus:outline-none flex items-center gap-1">{isExpanded ? "Read Less ↑" : "Read More ↓"}</button>
      )}
    </div>
  );
};

export default ContentRenderer;