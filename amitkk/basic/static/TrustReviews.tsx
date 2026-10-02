"use client";

export default function TrustReviews() {
  return (
    <div className="px-4 py-2 border-b border-teal-300 opacity-90 flex flex-col md:flex-row justify-between items-center gap-3 relative z-10">
      <div className="flex items-center gap-2">
        <h6 className="text-lg font-semibold text-white">4.7/5</h6>
        <p className="text-sm text-cyan-100/80">2.6k reviews</p>
      </div>

      <div className="flex items-center gap-2">
        <p className="font-semibold">Excellent</p>
        <p className="text-sm text-cyan-100/80">10K reviews</p>
      </div>
      
      <div className="text-center md:text-right">
        <p className="text-sm">Trusted by</p>
        <h6 className="text-lg font-bold text-white">8 million members</h6>
      </div>
    </div>
  );
}