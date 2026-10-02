"use client";

import { apiRequest, clo } from "@amitkk/basic/utils/my-utils/admin-utils";

interface Props<T> {
  endpoint: string;

  singleFunction: string;

  setData: React.Dispatch<
    React.SetStateAction<T[]>
  >;
}

export function useSingleRefresh<T>({
  endpoint,
  singleFunction,
  setData,
}: Props<T>) {

  const refreshSingle =
    async (id: string) => {

    if (!id) return;

    try {

      const res =
        await apiRequest(
          "POST",
          endpoint,
          {
            function:
              singleFunction,

            id,
          }
        );

      const item =
        res?.data;

      if (!item?._id) return;

      setData(
        (prev: any[] = []) => {

        const exists =
          prev.some(
            (i) =>
              String(i._id)
              ===
              String(item._id)
          );

        return exists
          ? prev.map((i) =>
              String(i._id)
              ===
              String(item._id)
                ? {
                    ...i,
                    ...item,
                  }
                : i
            )
          : [
              ...prev,
              item,
            ];
      });

    } catch (error) {

      clo(error);
    }
  };

  return {
    refreshSingle,
  };
}