// hooks/useAdminModal.ts

"use client";

import {
  useCallback,
  useState,
} from "react";

interface Props<T = any> {
  onUpdate?: (
    payload?: T
  ) => Promise<any>;
}

export function useAdminModal<
  T = any,
  E = Record<string, any>
>({
  onUpdate,
}: Props<T> = {}) {

  const [open, setOpen] =
    useState(false);

  const [
    selectedDataId,
    setSelectedDataId,
  ] = useState("");

  const [
    extraData,
    setExtraData,
  ] = useState<E | null>(
    null
  );

  // =====================================================
  // OPEN
  // =====================================================

  const handleOpen =
    useCallback((
      id?: string
    ) => {

      setSelectedDataId(
        id || ""
      );

      setOpen(true);

    }, []);

  // =====================================================
  // CLOSE
  // =====================================================

  const handleClose =
    useCallback(() => {

      setOpen(false);

      setSelectedDataId("");

      setExtraData(null);

    }, []);

  // =====================================================
  // UPDATE
  // =====================================================

  const handleUpdate =
    useCallback(async (
      payload?: T
    ) => {

      if (onUpdate) {

        await onUpdate(
          payload
        );
      }

      handleClose();

    }, [
      onUpdate,
      handleClose,
    ]);

  // =====================================================
  // RETURN
  // =====================================================

  return {

    open,

    selectedDataId,

    extraData,

    setExtraData,

    handleOpen,

    handleClose,

    handleUpdate,
  };
}