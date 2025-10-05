"use client";

import { Grid, Container } from "@mui/material";
import { SingleProductItem } from "@amitkk/product/static/single-product-item";
import { apiRequest, clo } from "@amitkk/basic/utils/utils";
import { useState, useEffect, useMemo } from "react";
import { SidebarShop } from "@amitkk/product/static/sidebar-shop";
import { ArrayProps } from "lib/models/types";

export default function Shop() {
  const [data, setData] = useState<SingleProductProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarData, setSidebarData] = useState<Record<string, ArrayProps[]>>({});
  const [isFetching, setIsFetching] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const res = await apiRequest("get", "product/product?function=get_product_modules");
        setSidebarData(res?.data ?? {});
      } catch (error) {
        clo(error);
      }
    };
    fetchSidebarData();
  }, []);

  const filterPayload = useMemo(() => {
    return { function: "get_products", filters: selectedFilters };
  }, [selectedFilters]);


 useEffect(() => {
  let isMounted = true;

  const fetchData = async () => {
    if (loading) {
    } else {
      setIsFetching(true);
    }

    try {
      const res = await apiRequest("post", "product/product", filterPayload);
      if (isMounted) {
        setData(res?.data ?? []);
      }
    } catch (error) { clo(error); } finally {
      if (isMounted) {
        if (loading) { setLoading(false); }
        setIsFetching(false);
      }
    }
  };

  fetchData();
  return () => {
    isMounted = false;
  };
}, [filterPayload]);

  const handleFilterChange = (key: string, values: string[]) => {
    setSelectedFilters((prev) => ({ ...prev, [key]: values }));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Container sx={{ py: 6 }}>
      <Grid container spacing={2}>
        <SidebarShop {...sidebarData} selected={selectedFilters} onChange={handleFilterChange}/>
        <Grid container size={9}>
          {data?.map((item, index) => ( <SingleProductItem key={index} row={item} /> ))}
        </Grid>
      </Grid>
    </Container>
  );
}