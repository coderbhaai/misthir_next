"use client";

import { TableRow, TableCell } from "@amitkk/components/basic/table";
import AdminRowActions from "@amitkk/components/admin/AdminRowActions";
import { ActionCell } from "@amitkk/components/basic/ActionCell";
import { ExcelProps } from "@amitkk/basic/types/excel";

type Props = {
  row: ExcelProps;
  onDelete: (id: string, type: string) => void;
};

export function AdminDataTable({ row, onDelete }: Props) {
  return (
    <>
      <TableRow>
        <TableCell>{row.model}</TableCell>
        <TableCell>{row.batch_no}</TableCell>
        <TableCell>{row.total_rows}</TableCell>
        <TableCell>{row.success_count}</TableCell>
        <TableCell>{row.failed_count}</TableCell>
        <TableCell>{row.status}</TableCell>
        <TableCell>
          {new Date(row.createdAt ?? new Date()).toLocaleDateString()}
        </TableCell>
        <ActionCell row={row} modelName={row.model} usePopover />
      </TableRow>

      <AdminRowActions id={row._id.toString()} actions={[
        { label: "Check", href: `/admin/excel/${row.model}/${row._id}` },
        { label: "Delete", onClick: () => onDelete(row._id.toString(), row.model) }
      ]}/>
    </>
  );
}