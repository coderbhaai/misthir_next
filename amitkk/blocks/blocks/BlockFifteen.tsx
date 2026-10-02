import { GenericBlock } from "@amitkk/basic/types/blocks";

interface Props {
  data: GenericBlock;
}

export default function BlockFifteen({ data }: Props) {
  if (!data) return null;

  return (
    <section className="bg-gradient-to-r from-[#00203F] to-[#003366] py-5 md:py-12">
      <div className="container flex flex-col md:flex-row justify-between items-center">
        <h3 className="text-white text-xl md:text-2xl">{data.heading}</h3>
        <button className="btn">Connect Now</button>
      </div>
    </section>
  );
}