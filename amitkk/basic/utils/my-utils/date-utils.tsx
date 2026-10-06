export function formatDeliveryDisplay(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString.includes("T") ? dateString : `${dateString}T00:00:00`);
  
  const estNow = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
  const tomorrow = new Date(estNow);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isTomorrow =
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear();

  const formattedDate = date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  return isTomorrow ? `Tomorrow, ${formattedDate}` : `${date.toLocaleDateString("en-US", { weekday: "long" })}, ${formattedDate}`;
}

export function formatTimeAgo(dateString?: Date | string): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}