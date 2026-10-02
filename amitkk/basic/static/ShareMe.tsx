import Link from "next/link";
import Image from "next/image";
import { Button } from "@amitkk/components/button/button";

export default function ShareMe() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="text-sm font-medium">Share on</p>

      <Button asChild size="icon" variant="ghost" className="text-[#1877F2]">
        <Link href="https://www.facebook.com/tripsandstay" target="_blank">
          <Image src={`/images/icons/social/facebook.svg`} alt="Share on Facebook" width={20} height={20}/>
        </Link>
      </Button>

      <Button asChild size="icon" variant="ghost" className="text-black dark:text-white">
        <Link href="https://twitter.com" target="_blank">
          <Image src={`/images/icons/social/twitter.svg`} alt="Share on Twitter" width={20} height={20}/>
        </Link>
      </Button>

      <Button asChild size="icon" variant="ghost" className="text-[#0A66C2]">
        <Link href="https://linkedin.com" target="_blank">
          <Image src={`/images/icons/social/linkedin.svg`} alt="Share on Linkedin" width={20} height={20}/>
        </Link>
      </Button>
    </div>
  );
}