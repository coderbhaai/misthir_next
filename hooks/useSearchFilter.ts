import * as React from "react";

type KeySelector<T> = keyof T | ((item: T) => string | undefined);

export function useSearchFilter<T>(data: T[], key: KeySelector<T> = "name" as keyof T) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filteredData, setFilteredData] = React.useState<T[]>(data);

  const getValue = (item: T): string => {
    if (typeof key === "function") { return (key(item) || "").toLowerCase(); }
    return String(item[key] ?? "").toLowerCase();
  };

  React.useEffect(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      setFilteredData(data);
    } else {
      setFilteredData(
        data.filter((item) => getValue(item).includes(query))
      );
    }
  }, [searchQuery, data]);

  return { searchQuery, setSearchQuery, filteredData };
}