import { MetaTableProps } from "@amitkk/basic/types/page";
import { Types } from "mongoose";

type MetaInputProps = {
 meta: string | Types.ObjectId | MetaTableProps | null;
};

const MetaTableInput: React.FC<MetaInputProps> = ({ meta }) => {
  if (!meta) { return <>No Meta</>; }
  if (typeof meta === "string") { return <>Meta ID: {meta}</>; }
  if ("_bsontype" in (meta as any)) { return <>Meta ObjectId: {(meta as any).toString()}</>; }

  const obj = meta as MetaTableProps;
  return (
    <>
      Title: {obj.title ?? "-"} ({obj.title?.length ?? 0}) <br />
      Description: {obj.description ?? "-"} ({obj.description?.length ?? 0})
    </>
  );
};

export default MetaTableInput;