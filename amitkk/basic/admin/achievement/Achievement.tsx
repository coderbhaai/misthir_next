import { useEffect, useRef, useState } from "react";
import type { AchievementProps } from "@amitkk/basic/types";
import type { PageDetailProps } from "@amitkk/basic/types/page";
import HeaderCrumbOne from "@amitkk/components/ui/HeaderCrumbOne";
import { UI_STRINGS } from "@amitkk/basic/utils/config";

interface AchievementSectionProps {
  achievements: AchievementProps[];
  details?: PageDetailProps;
}

function Counter({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;

    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;

      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration]);
  return <>{count}</>;
}

export default function Achievement({ achievements, details }: AchievementSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (!achievements?.length) return null;

  const heading = details?.achievement_title?.trim() || UI_STRINGS.achievement_title;
  const text = details?.achievement_text?.trim() || UI_STRINGS.achievement_text;

  return (
    <section ref={sectionRef} className="bg-[#0b1a3c] py-14 text-white md:py-20">
      <div className="container">
        <HeaderCrumbOne heading={heading} text={text} />

        <div className="mt-10 grid grid-cols-2 gap-8 text-center md:grid-cols-4">
          {achievements.map((item, index) => (
            <div key={item._id?.toString() || index}>
              <h3 className="text-3xl font-bold text-white md:text-5xl">
                {isVisible ? <Counter end={Number(item.value) || 0} /> : 0}+
              </h3>

              <p className="mt-3 text-sm text-white/80 md:text-base">
                {item.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}