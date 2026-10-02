import React from "react";

export interface Props {
  heading?: string | null;
  text?: string | null;
  heading_className?: string;
  text_className?: string;
}

export default function HeaderCrumbThree({ heading, text }: Props) {
  const displayHeading = heading?.trim() || "";
  const displayText = text?.trim() || "";

  return (
    <div>
        {displayHeading && ( 
          <h2 className="border-l-4 border-primary pl-3 text-2xl font-semibold text-primary md:text-3xl">
            <div className="content text-base text-gray-500" dangerouslySetInnerHTML={{ __html: displayHeading }}/>
          </h2> )}
        {displayText && ( <div className="content text-base text-gray-500" dangerouslySetInnerHTML={{ __html: displayText }}/> )}
    </div>
  );
}
