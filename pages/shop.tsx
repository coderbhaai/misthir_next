"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { apiRequest, clo } from "@amitkk/basic/utils/my-utils/admin-utils";
import { SidebarShop } from "@amitkk/product/static/sidebar-shop";
import { SingleProductItem } from "@amitkk/product/static/single-product-item";
import { ArrayProps } from "lib/models/types";
import CustomModal from "@amitkk/basic/static/CustomModal";
import { HorizontalSidebarShop } from "@amitkk/product/static/horizontal-sidebar-shop";
import { useMediaQuery } from "hooks/use-media-query";
import { SingleProductItemProps } from "@amitkk/product/types";

interface SidebarData {
  category?: ArrayProps[];
  tag?: ArrayProps[];
  type?: ArrayProps[];
  brand?: ArrayProps[];
  material?: ArrayProps[];
  purpose?: ArrayProps[];
  [key: string]: ArrayProps[] | undefined;
}

interface ShopProps {
  type?: string;
  slug?: string;
  initialRecord?: any;
}

const STORAGE_KEY = "shop_selected_filters";

export default function Shop({ type, slug, initialRecord }: ShopProps) {
  const [pageRow, setPageRow] = useState(0);
  const [products, setProducts] = useState<SingleProductItemProps[]>([]);
  const [sidebarData, setSidebarData] = useState<SidebarData>({});
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const isMobile = useMediaQuery("(max-width: 767px)");

  const [activeIds, setActiveIds] = useState<Record<string, string | undefined>>({});
  const [parentIds, setParentIds] = useState<Record<string, string[]>>({});
  const requestIdRef = useRef(0);

  const productRequestIdRef = useRef(0);
  const sidebarRequestIdRef = useRef(0);

  // Disable browser automatic scroll restoration on back/forward and force top scroll
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  // Initialize filters from localStorage, falling back to initialRecord or empty object
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedFilters = localStorage.getItem(STORAGE_KEY);
        if (savedFilters) {
          const parsed = JSON.parse(savedFilters);
          if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error("Failed to load filters from localStorage", e);
      }
    }

    if (initialRecord?.filterKey && initialRecord?._id) {
      return {
        [initialRecord.filterKey]: [String(initialRecord._id)],
      };
    }
    return {};
  });

  // Save filters to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedFilters));
    }
  }, [selectedFilters]);

  const [activeTypeId, setActiveTypeId] = useState<string | null>(() => {
    if (initialRecord?.filterKey === "type") {
      return String(initialRecord._id);
    }
    return null;
  });

  useEffect(() => {
    if (!initialRecord) return;

    if (initialRecord.filterKey === "type") {
      const id = String(initialRecord._id);

      setSelectedFilters((prev) => ({
        ...prev,
        type: [id],
      }));

      setActiveIds((prev) => ({ ...prev, type: id }));
      setParentIds((prev) => ({ ...prev, type: [id] }));
    }
  }, [initialRecord]);

  useEffect(() => {
    if (!initialRecord) return;

    if (initialRecord.filterKey === "type") {
      const id = String(initialRecord._id);

      setSelectedFilters({
        type: [id],
      });

      setActiveIds((prev) => ({ ...prev, type: id }));
      setParentIds((prev) => ({ ...prev, type: [id] }));
    }
  }, [initialRecord]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search ?? "");
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);
  
  useEffect(() => {
    setPageRow(0);
    setProducts([]);
    setHasMore(true);
    loadingRef.current = false;
  }, [debouncedSearch]);

  useEffect(() => {
    const requestId = ++sidebarRequestIdRef.current;

    const url = "product/product?function=get_product_modules";

    apiRequest("POST", url)
      .then((res) => {
        if (requestId !== sidebarRequestIdRef.current) return;

        setSidebarData(res?.data ?? {});
      }).catch(clo);
  }, []);

  useEffect(() => {
    setProducts([]);
    setPageRow(0);
    setHasMore(true);
    loadingRef.current = false;
  }, [selectedFilters, debouncedSearch]);

  useEffect(() => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    const requestId = ++productRequestIdRef.current;

    const isFirstPage = pageRow === 0;

    apiRequest("POST", "product/product", {
      function: "get_products",
      filterRow: selectedFilters,
      search: debouncedSearch,
      pageRow,
      limit: 20,
    }).then((res) => {
        if (requestId !== productRequestIdRef.current) return;

        const newData = res?.data ?? [];

        setProducts((prev) => {
          if (isFirstPage) return newData;

          const merged = [...prev, ...newData];
          const map = new Map();
          merged.forEach((item) => map.set(item._id.toString(), item));
          return Array.from(map.values());
        });

        if (newData.length < 20) setHasMore(false);
      }).catch(clo).finally(() => { setLoading(false); loadingRef.current = false; });

  }, [pageRow, selectedFilters, debouncedSearch]);
  
  useEffect(() => {
    if (!hasMore) return;

    const currentRef = loadMoreRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current) {
          setPageRow((prev) => prev + 1);
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasMore]);  

  const handleFilterChange = ({ key, values, lastSelected, parentPath }: { key: string; values: string[]; lastSelected?: string; parentPath?: string[]; }) => {
    setSelectedFilters((prev) => ({ ...prev, [key]: values }));
    setActiveIds((prev) => ({ ...prev, [key]: lastSelected }));
    setParentIds((prev) => ({ ...prev, [key]: parentPath || [] }));
  };

  return (
    <div className="container py-5 md:py-12">
      <div className="row">
        {!isMobile && (
          <div className="md:col-span-3">
            <SidebarShop {...sidebarData} selected={selectedFilters} onChange={handleFilterChange} search={search} onSearchChange={setSearch}/>
          </div>
        )}

        <div className="col-span-12 md:col-span-9 md:pl-5 flex flex-col gap-4">
          {!isMobile && ( <HorizontalSidebarShop {...sidebarData} selected={selectedFilters} onChange={handleFilterChange} search={search} onSearchChange={setSearch}/> )}

          <div className="row">
            {!loading && products.length === 0 && (
              <div className="col-span-12 flex flex-col items-center justify-center py-10 text-center">
                <h6 className="mb-2 text-lg font-medium">No products found</h6>
                <p className="text-gray-500">Try changing filters or search terms</p>
              </div>
            )}
    
            {products.length > 0 && products.map((i) => (
                <SingleProductItem row={i as any} />
            ))}

            {hasMore && ( <div className="col-span-12" ref={loadMoreRef} style={{ height: 1 }} /> )}
            
            {loading && (
              <div className="col-span-12 text-center py-4">
                <p className="text-gray-500">Loading More Products...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isMobile && (
        <div className="fixed bottom-0 left-0 w-full z-40 bg-white border-t p-3 pb-safe">
          <button onClick={() => setOpenFilters(true)} className="w-full bg-primary text-white py-3 rounded-lg shadow-md font-medium">
            MENU
          </button>
        </div>
      )}

      {isMobile && (
        <CustomModal open={openFilters} handleClose={() => setOpenFilters(false)} title="Filters" variant="drawer" width="100%">
          <div className="flex flex-col h-full bg-white relative">
            <div className="flex-1 overflow-y-auto pb-20">
              <SidebarShop {...sidebarData} selected={selectedFilters} onChange={handleFilterChange} search={search} onSearchChange={setSearch}/>
            </div>
            <div className="absolute bottom-0 left-0 w-full bg-white border-t p-3 z-50">
              <button onClick={() => setOpenFilters(false)} className="w-full bg-primary text-white py-3 rounded-lg font-medium">
                Apply Filters
              </button>
            </div>
          </div>
        </CustomModal>
      )}
    </div>
  );
}