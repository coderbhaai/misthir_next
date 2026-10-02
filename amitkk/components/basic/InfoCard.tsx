interface InfoCardProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export default function InfoCard({ label, value, className = "" }: InfoCardProps) {
  if (value === undefined || value === null || value === "") return null;

  return (
    <div className={`rounded-xl bg-gray-50 p-3 ${className}`}>
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="font-semibold mt-1">{value}</div>
    </div>
  );
}