import { UserRowProps } from "@amitkk/blog/types/blog";

export default function UserName({ row }: { row?: Partial<UserRowProps> }) {
  if (!row) return null; 

  return(
    <>
      { row.name }
    </>
  );
}