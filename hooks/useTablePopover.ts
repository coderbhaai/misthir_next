"use client";

import { useState, useCallback } from "react";

export function useTablePopover() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const handleOpen = useCallback( ( event: React.MouseEvent<HTMLButtonElement> ) => { setAnchorEl(event.currentTarget); }, []);
  const handleClose = useCallback(() => { setAnchorEl(null); }, []);
  return { anchorEl, open: !!anchorEl, handleOpen, handleClose };
}