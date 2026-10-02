import React from "react";

type DateTimeFormatProps = {
  value?: string | Date | null;
  label?: string;
  type?: "date" | "time";
  className?: string;
};

const formatTime12Hour = (timeStr: string): string => {
  if (!timeStr) return "";
  const [hoursStr, minutesStr] = timeStr.split(":");
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr ? minutesStr.substring(0, 2) : "00";
  if (isNaN(hours)) return timeStr;
  
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
};

const DateTimeFormat: React.FC<DateTimeFormatProps> = ({
  value,
  label,
  type = "date",
  className,
}) => {
  if (!value) return null;

  let formattedResult = "";

  if (type === "date") {
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;

    formattedResult = d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } else if (type === "time") {
    formattedResult = formatTime12Hour(String(value));
  }

  return (
    <div className={className} style={{ marginBottom: "4px" }}>
      {label && <strong>{label}: </strong>}
      <span>{formattedResult}</span>
    </div>
  );
};

export default DateTimeFormat;