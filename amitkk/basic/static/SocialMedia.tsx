import Link from "next/link";
import Image from "next/image";
import amitkk from "../utils/amitkk";

interface SocialMediaProps {
  className?: string;
  iconClassName?: string;
  spacing?: string;
}

export default function SocialMedia({className = "", iconClassName = "h-5 w-5", spacing = "gap-3"}: SocialMediaProps) {
  return (
    <div className={`flex items-center ${spacing} ${className}`}>
      {amitkk.socialLinks.map((social, index) => (
        <Link key={index} href={social.url} target="_blank" rel="noopener noreferrer" aria-label={social.name} className="transition-all duration-200 hover:scale-110">
          <Image src={`/images/icons/social/${social.icon}`} alt={social.name} width={20} height={20} className={iconClassName}/>
        </Link>
      ))}
    </div>
  );
}