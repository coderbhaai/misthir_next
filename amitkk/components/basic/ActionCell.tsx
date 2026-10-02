// ActionCell.tsx

"use client";

import React from "react";
import StatusSwitch from '@amitkk/components/admin/status-switch';
import {Iconify} from "@amitkk/basic/utils/my-utils/admin-utils";
import { TableCell } from "@amitkk/components/basic/table";
import { Button } from "@amitkk/components/button/button";
import { openAdminRowActions } from "@amitkk/components/admin/AdminRowActions";
import DateTimeFormat from "@amitkk/components/admin/date-format";

type ActionCellProps = {
  row: any;
  modelName?: string;
  onEdit?: (row: any) => void;
  admin?: {handleEdit?: (id: string) => void;};
  usePopover?: boolean;
  show_status?: boolean;
  statusKey?: string;
  onStatusChange?: (id: string | number, newStatus: boolean) => void;
  show_date?: boolean;
};

export function ActionCell({
  row,
  modelName = "",
  onEdit,
  admin,
  usePopover = false,
  show_status = true,
  statusKey = "status",
  onStatusChange,
  show_date = true
}: ActionCellProps) {
  const id = row._id;

  if (!row.allow_edit && !show_status && !show_date) { return null; }

  const handleEdit = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (usePopover) { openAdminRowActions(id.toString(), event); return; }
    if (onEdit) { onEdit(row); return; }

    admin ?.handleEdit ?.(id.toString());
  };
  
  return (
    <TableCell className="text-right">
      <span className="flex items-center justify-end gap-2">
        {show_status && (
          <StatusSwitch id={id} status={row[statusKey]} modelName={modelName} onStatusChange={onStatusChange}/>
        )}

        {show_date && ( <DateTimeFormat value={row.createdAt}/> )}

        {(row.allow_edit ?? true) && (
          <Button type="button" variant="ghost" size="icon" onClick={handleEdit}>
            <Iconify icon="Edit" />
          </Button>
        )}
      </span>
  </TableCell>
  );
}