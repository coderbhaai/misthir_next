"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, clo } from "@amitkk/basic/utils/my-utils/admin-utils";
import { useFilterContext } from "contexts/FilterContext";
import { useAdminModal } from "./useAdminModal";

interface Props {
  listEndpoint: string;
  listFunction: string;
  singleFunction?: string;
  addRoute?: string;
  listPayload?: Record<string, any>;
  singlePayload?: Record<string, any>;
}

interface FetchDataProps {
  [key: string]: any;
}

export function useAdminPage<T>({ listEndpoint, listFunction, singleFunction, addRoute, listPayload, singlePayload }: Props) {
  const router = useRouter();
  const { filters, page, rowsPerPage } = useFilterContext();
  const stableListPayload = useMemo(() => listPayload || {}, [listPayload]);
  const stableSinglePayload = useMemo(() => singlePayload || {}, [singlePayload]);

  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 0, limit: rowsPerPage, });
  const fetchData: (extraPayload?: FetchDataProps) => Promise<any> =
    useCallback(async (extraPayload = {}) => {
      try {
        const res = await apiRequest("POST", listEndpoint, { function: listFunction, ...stableListPayload, ...extraPayload });
        setData( res?.data ?? [] );
        setPagination( res?.pagination ?? { total: 0, page: 0, limit: rowsPerPage, } );
        return res;
      } catch (error) { clo(error); }
    }, [ listEndpoint, listFunction, rowsPerPage ]);

  useEffect(() => { fetchData(); }, [ fetchData, filters, page, rowsPerPage ]);
  
  const refreshSingle = useCallback(async (id?: string) => {
      if (!id || !singleFunction) return;

      try {
        const res = await apiRequest("POST", listEndpoint, { function: singleFunction, id, ...stableSinglePayload });
        const item = res?.data;

        if (!item?._id) return;

        setData(
          (prev: any[] = []) => {
            const exists = prev.some( (i) => String(i._id) === String(item._id) );
            return exists ? prev.map((i) => String(i._id) === String(item._id) ? {...i, ...item } : i) : [ item, ...prev ];
          }
        );

        return item;
      } catch (error) { clo(error); }
    }, [ listEndpoint, singleFunction ]);
    
  const modal = useAdminModal({ onUpdate: fetchData });
  
  const handleAddNew =
    useCallback(() => {
      if (addRoute) {
        router.push( addRoute );
        return;
      }
      modal.handleOpen();
    }, [ addRoute, modal, router ]);

  const handleEdit = useCallback(( id: string ) => {
      if (addRoute){
        router.push(`${addRoute}/${id}`);
        return;
      }
      modal.handleOpen(id);
    }, [ addRoute, modal, router ]);

  return { data, setData, pagination, fetchData, refreshSingle, handleAddNew, handleEdit, modal };
}