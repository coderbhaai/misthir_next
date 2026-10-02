interface Props {
  item: {
    label: string;
    value?: React.ReactNode;
  };
}

export default function InfoRow({ item }: Props) {
  if (item.value === undefined || item.value === null || item.value === "") {
    return null;
  }

  return (
    <div className="flex items-center justify-between pb-1">
      <span className="text-gray-500">{item.label}</span>
      <strong className="text-right text-gray-900">{item.value}</strong>
    </div>
  );
}