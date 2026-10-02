"use client";

import { Pencil } from "lucide-react";
import { TableCell } from "@amitkk/components/basic/table";
import { Button } from "@amitkk/components/button/button";

type EditCellProps = {
  onClick: () => void;
  allow_edit?: boolean;
};

export function EditCell({onClick, allow_edit = true}: EditCellProps) {
  if (!allow_edit) return null;

  return (
    <TableCell className="text-right">
      <Button variant="ghost" size="icon" onClick={onClick}>
        <Pencil className="h-4 w-4" />
      </Button>
    </TableCell>
  );
}