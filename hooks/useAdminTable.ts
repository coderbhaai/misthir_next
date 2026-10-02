"use client";

import { useCallback, useEffect, useState } from "react";
import { useFilterContext } from "contexts/FilterContext";
import { apiRequest, clo } from "@amitkk/basic/utils/my-utils/admin-utils";

interface UseAdminTableProps {
    listEndpoint: string;
    listFunction: string;
    singleFunction: string;
}

export function useAdminTable<T>({
    listEndpoint,
    listFunction,
    singleFunction,
}: UseAdminTableProps) {

    const { filters, page, rowsPerPage } = useFilterContext();

    const [data, setData] = useState<T[]>([]);

    const [pagination, setPagination] = useState({
        total: 0,
        page: 0,
        limit: rowsPerPage,
    });

    const fetchFilterData = useCallback(async () => {
        try {

            const res = await apiRequest(
                "POST",
                listEndpoint,
                {
                    function: listFunction,
                }
            );

            setData(res?.data ?? []);

            setPagination(
                res?.pagination ?? {
                    total: 0,
                    page: 0,
                    limit: rowsPerPage,
                }
            );

        } catch (error) {
            clo(error);
        }

    }, [listEndpoint, listFunction, rowsPerPage]);

    useEffect(() => {
        fetchFilterData();
    }, [fetchFilterData, filters, page, rowsPerPage]);

    const refreshSingle = async (id: string) => {

        if (!id) return;

        try {

            const res = await apiRequest(
                "GET",
                `${listEndpoint}?function=${singleFunction}&id=${id}`
            );

            const item = res?.data;

            if (!item?._id) return;

            setData((prev: any[] = []) => {

                const exists = prev.some(
                    (i) => String(i._id) === String(item._id)
                );

                return exists
                    ? prev.map((i) =>
                        String(i._id) === String(item._id)
                            ? { ...i, ...item }
                            : i
                    )
                    : [...prev, item];
            });

        } catch (error) {
            clo(error);
        }
    };

    return {
        data,
        setData,
        pagination,
        fetchFilterData,
        refreshSingle,
    };
}