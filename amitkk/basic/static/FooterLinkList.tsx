import Link from "next/link";

export interface FooterLinkItem {
  name: string;
  url: string;
}

interface FooterLinkListProps {
  heading: string;
  items: FooterLinkItem[];
  align?: "left" | "center" | "right";
}

const FooterLinkList = ({
  heading,
  items,
  align = "center",
}: FooterLinkListProps) => {

  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const alignmentClass =
    align === "left"
      ? "items-start text-left"
      : align === "right"
      ? "items-end text-right"
      : "items-center text-center";

  return (
    <div
      className={`
        flex
        flex-col
        ${alignmentClass}
      `}
    >

      {/* HEADING */}
      <p
        className="
          mb-4
          text-xs
          font-medium
          uppercase
          tracking-widest
          text-[#aef0f4]
        "
      >
        {heading}
      </p>

      {/* LINKS */}
      <ul
        className="
          flex
          flex-col
          gap-3
        "
      >
        {items.map((item, index) => (

          <li key={`${item.url}-${index}`}>

            <Link
              href={item.url}
              className="
                text-sm
                text-white/90
                transition-all
                hover:underline
                hover:underline-offset-4
              "
            >
              {item.name}
            </Link>

          </li>

        ))}
      </ul>

    </div>
  );
};

export default FooterLinkList;