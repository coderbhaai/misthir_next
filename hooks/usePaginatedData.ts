import { useEffect, useState, useCallback, useRef } from "react";
import { apiRequest } from "@amitkk/basic/utils/my-utils/admin-utils";

interface PaginatedHookProps<T = any> {
  initialData: T[];
  basePath?: string;
  params?: Record<string, string>;
  limit?: number;
  rootMargin?: string;
  threshold?: number;
}

export function usePaginatedData<T>({
  initialData = [],
  basePath = "agency/portfolio",
  params = {},
  limit = 10,
  rootMargin = "200px",
  threshold = 0.1,
}: PaginatedHookProps<T>) {
  const [data, setData] = useState<T[]>(initialData);
  const [pageRow, setPageRow] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const hasUserScrolledRef = useRef(false);
  const isFetchingRef = useRef(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const enablePagination = () => {
      hasUserScrolledRef.current = true;
    };

    window.addEventListener("wheel", enablePagination, { passive: true, once: true });
    window.addEventListener("touchmove", enablePagination, { passive: true, once: true });

    return () => {
      window.removeEventListener("wheel", enablePagination);
      window.removeEventListener("touchmove", enablePagination);
    };
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || isFetchingRef.current || !hasUserScrolledRef.current) return;

    isFetchingRef.current = true;
    setLoading(true);

    try {
      const nextPage = pageRow + 1;
      const query = new URLSearchParams({
        page_row: String(nextPage),
        limit: String(limit),
        ...params,
      });

      const res = await apiRequest("GET", `${basePath}?${query.toString()}`);

      if (!res?.data?.length) {
        setHasMore(false);
        return;
      }

      setData((prev: any[]) => {
        const existingIds = new Set(prev.map((item: any) => String(item._id)));
        const uniqueItems = res.data.filter((item: any) => !existingIds.has(String(item._id)));
        return [...prev, ...uniqueItems];
      });

      setPageRow(nextPage);
      setHasMore(Boolean(res?.hasMore));
    } catch (err) {
      setHasMore(false);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [basePath, params, limit, hasMore, loading, pageRow]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !loading) {
        loadMore();
      }
    },
    [hasMore, loading, loadMore]
  );

  useEffect(() => {
    const element = observerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin,
      threshold,
    });

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [handleObserver, rootMargin, threshold]);

  return {
    data,
    loading,
    hasMore,
    loadMore,
    observerRef,
  };
}