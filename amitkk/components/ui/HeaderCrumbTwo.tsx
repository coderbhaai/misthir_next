import React from "react";

export interface HeaderCrumbOneProps {
  heading?: string | null;
  text?: string | null;
  heading_className?: string;
  text_className?: string;
}

export default function HeaderCrumbTwo({ heading, text }: HeaderCrumbOneProps) {
  const displayHeading = heading?.trim() || "";
  const displayText = text?.trim() || "";

  return (
    <div>
        {displayHeading && ( <h2 className="border-l-4 border-primary pl-3 text-2xl font-semibold text-primary md:text-3xl">{displayHeading}</h2> )}
        {displayText && ( <p>{displayText}</p> )}
    </div>
  );
}
