import { UserRowProps } from "@amitkk/blog/types/blog";

export default function UserRow({ row }: { row?: Partial<UserRowProps> }) {
  if (!row) return null; 

  return(
    <>
      { row.name }<br/>
      <small>{[row.email, row.phone].filter(Boolean).join(" || ")}</small>
    </>
  );
}