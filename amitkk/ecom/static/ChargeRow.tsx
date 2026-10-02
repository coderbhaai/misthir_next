interface ChargeRowProps {
  label: string;
  value?: number | string | null;
  prefix?: string;
}

export default function ChargeRow({ label, value, prefix = "₹" }: ChargeRowProps) {
  const numericValue = Number(value);
  if (value === undefined || value === null || isNaN(numericValue) || numericValue <= 0) { return null; }

  return (
    <div className="flex justify-between mb-2 text-sm">
      <span>{label}</span>
      <span>{prefix}{numericValue}</span>
    </div>
  );
}