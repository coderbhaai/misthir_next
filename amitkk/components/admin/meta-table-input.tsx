import type { MetaTableProps } from "@amitkk/seo/types";

type MetaInputProps = {
  meta: string | MetaTableProps;
};

const MetaTableInput: React.FC<MetaInputProps> = ({ meta }) => {
  if (!meta) {
    return <>No Meta</>;
  }
  if (typeof meta === "string") {
    return <>Meta ID: {meta}</>;
  }
  if ("_bsontype" in (meta as any)) {
    return <>Meta ObjectId: {(meta as any).toString()}</>;
  }

  const obj = meta as MetaTableProps;

  return (
    <div className="break-words whitespace-normal leading-relaxed" style={{ maxWidth: "500px"}}>
      <strong>Title:</strong> {obj.title ?? "-"} ({obj.title?.length ?? 0})
      <br />
      <strong>Description:</strong> {obj.description ?? "-"} ({obj.description?.length ?? 0})
    </div>
  );
};

export default MetaTableInput;