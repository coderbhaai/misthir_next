import { GenericBlock } from "@amitkk/basic/types/blocks";
import WebMobileMedia from "@amitkk/basic/admin/media/WebMobileMedia";

interface Props {
  data: GenericBlock;
}

export default function BlockSixteen({ data }: Props) {
  if (!data) return null;

  return (
    <div className="relative">
      <WebMobileMedia item={data} width={96} height={96} style={{ objectFit: "cover", width: "100%", height: "100%" }}/>
      <h1 className="heading absolute bottom-0 text-center text-white w-full pb-3">{data.heading}</h1>
    </div>
  );
}