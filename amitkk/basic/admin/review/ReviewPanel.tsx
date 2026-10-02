import { useState } from "react";
import Image from "next/image";
import type { ReviewProps } from "@amitkk/basic/types";

export default function ReviewPanel({ reviews, module, module_id }: { reviews: ReviewProps[]; module: string; module_id: string }) {
  const [starSelected, setStarSelected] = useState<number | null>(null);
  const [activeReview, setActiveReview] = useState<ReviewProps | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = starSelected ? reviews.filter((r) => r.rating === starSelected) : reviews;
  const mediaList = activeReview?.mediaHub || [];

  const starCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const total = reviews.length || 1;
    return { star, percentage: Math.round((count / total) * 100) };
  });

  const open = (r: ReviewProps) => { setActiveReview(r); setIsModalOpen(true); setActiveIndex(0); };
  const close = () => setIsModalOpen(false);

  const prev = () => setActiveIndex((i) => (i === 0 ? mediaList.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === mediaList.length - 1 ? 0 : i + 1));

  return (
    <div className="container py-5 md:py-12">
      <h2 className="mb-6 text-xl font-bold">{starSelected ? `${starSelected} Star Reviews` : "All Reviews"}</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Left */}
        <div className="md:col-span-4">
          <p className="mb-4 text-center text-sm">{reviews.length} Total Reviews</p>

          <div className="space-y-3">
            {starCounts.map(({ star, percentage }) => (
              <div key={star} onClick={() => setStarSelected(star)} className="flex cursor-pointer items-center gap-2">
                <span className="w-16 text-sm">{star} Star</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
                </div>
                <span className="w-10 text-xs">{percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="md:col-span-8 space-y-4">
          {filtered.map((r) => (
            <div key={String(r._id)} onClick={() => open(r)} className="cursor-pointer rounded-xl border p-4 hover:shadow-md">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm">
                  {typeof r.user_id === "object" ? r.user_id?.name?.charAt(0) : "U"}
                </div>
                <div>
                  <p className="font-semibold">{typeof r.user_id === "object" ? r.user_id?.name : "User"}</p>
                  <p className="text-xs text-gray-500">{new Date(r.updatedAt).toLocaleDateString("en-IN")}</p>
                </div>
              </div>

              <p className="mb-2 text-sm">{r.review}</p>

              {r.mediaHub && r.mediaHub?.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {r.mediaHub.map((m) => (
                    <Image key={String(m._id)} src={m.path} alt={m.alt || "media"} width={80} height={60} className="rounded-md object-cover" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <button onClick={close} className="absolute right-4 top-4 rounded-full bg-white p-2">✕</button>

          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white p-3">
            <img src="/images/icons/admin/slide-left.svg" className="h-5 w-5" />
          </button>

          <div className="relative w-[90vw] max-w-4xl">
            <Image src={mediaList[activeIndex]?.path || ""} alt="" width={1000} height={600} className="object-contain" />
          </div>

          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white p-3">
            <img src="/images/icons/admin/slide-right.svg" className="h-5 w-5" />
          </button>

          <div className="absolute bottom-6 flex gap-2">
            {mediaList.map((m, i) => (
              <img key={String(m._id)} src={m.path} onClick={() => setActiveIndex(i)} className={`h-16 w-20 cursor-pointer rounded ${i === activeIndex ? "ring-2 ring-primary" : ""}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}