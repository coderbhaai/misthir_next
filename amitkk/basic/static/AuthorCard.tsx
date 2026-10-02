import { AuthorProps } from "../types/shared";

export default function AuthorCard({ row }: { row?: Partial<AuthorProps> | string; }) {
  if ( !row || typeof row === "string" ) return null;

  const imagePath = (row?.media_id as any)?.path || "/default.jpg";
  const imageAlt = (row?.media_id as any)?.alt || "Inspiration Image";
  return(
    <div className="flex">
      <img src={imagePath} alt={imageAlt} style={{ width: 150, height: 120, borderRadius: "8px" }}/>
      <div>
        <h3 className="mt-3"><strong>Author: {row?.name}</strong></h3>
        <div dangerouslySetInnerHTML={{ __html: row?.content || "" }} />
      </div>
    </div>
  );
}