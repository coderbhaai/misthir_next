import { UserRowProps } from "@amitkk/basic/types/user";

export default function UserName({ row }: { row?: Partial<UserRowProps> }) {
  if (!row) return null; 

  return(
    <>
      { row.name }
    </>
  );
}