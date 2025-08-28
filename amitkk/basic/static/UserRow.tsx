import { UserRowProps } from "@amitkk/blog/types/blog";

export default function AuthorCard({ row }: { row?: Partial<UserRowProps> }) {
  if (!row) return null; 

  return(
    <>
      { row.name }
      <br/>
      <small>
        {row.email ? row.email : null }
        {row.phone ? `|| row.phone` : null }
      </small>
    </>
  );
}