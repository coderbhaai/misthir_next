import WebMobileMedia from "@amitkk/basic/admin/media/WebMobileMedia";
import { GenericBlock } from "@amitkk/basic/types/blocks";
import { Button } from "@amitkk/components/button/button";

interface Props {
  service: string;
  data: GenericBlock;
}

export default function BlockSeventeen({ data, service }: Props) {
  if (!data) return null;

  return (
    <div className="relative">
      <WebMobileMedia item={data} width={96} height={96} style={{ objectFit: "cover", width: "100%", height: "100%" }}/>
      <div className="absolute top-0 flex flex-col items-center h-full w-full justify-center">
        <h2 className="heading text-center text-white w-full">{data.heading}</h2>
        <Button className="btn">Book for {service}</Button>
      </div>
    </div>
  );
}