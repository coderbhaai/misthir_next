import type { MediaProps } from "@amitkk/basic/types/media";

interface Props {
  image: MediaProps;
  onClick?: () => void;
  active?: boolean;
}

export default function SimpleMediaThumb({ image, onClick, active = false }: Props) {
  return (
    <div onClick={onClick} aria-label={image?.alt} className="relative w-fit overflow-hidden rounded-md transition-all duration-300 cursor-pointer">
       <img src={image?.path} alt={image?.alt} style={{ width: "120px", display: "block" }} className={`rounded-md transition-all duration-300 ${active ? "border-2 border-orange-500 shadow-lg" : "border-2 border-transparent"}`}/>
    </div>
  );
}