import Link from "next/link";

export interface HeaderCrumbOneProps {
  heading?: string | null;
  text?: string | null;
  url?: string | null;
  url_text?: string | null;
}

export default function HeaderCrumbOne({heading, text, url, url_text}: HeaderCrumbOneProps) {
  const displayHeading = heading?.trim() || "";
  const displayText = text?.trim() || "";

  return (
    <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div className="py-2">
        {displayHeading && (
          <h2 className="border-l-4 border-primary pl-3 text-2xl font-semibold text-primary md:text-3xl">{displayHeading}</h2>
        )}

        {displayText && (
          <p className="pt-3 text-sm text-muted-foreground md:text-base">{displayText}</p>
        )}
      </div>

      {url && url_text && ( <Link href={url} className="btn">{url_text}</Link> )}
    </div>
  );
}