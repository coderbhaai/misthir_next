import { TableCell, TableRow } from '@amitkk/components/basic/table';
import { ErrorLogProps } from '@amitkk/basic/types';
import UserRow from '@amitkk/basic/static/UserRow';
import React from 'react';
import type { UserRowProps } from '@amitkk/basic/types/user';
import { Trash2 } from "lucide-react";

type Props = {
  row: ErrorLogProps;
   onDelete: (id: string) => void;
};

export function AdminDataTable({ row, onDelete }: Props) {
  const cellScrollClass =
    "max-h-[120px] max-w-[400px] overflow-y-auto overflow-x-hidden whitespace-normal block";

  return (
    <TableRow>
      <TableCell>
        <div className={cellScrollClass}>
          {row.api && ( <><strong>API :</strong> {row.api}<br /></> )}
          {row.stack && ( <><strong>Stack :</strong> {row.stack}<br /></> )}
          {row.function && ( <><strong>Function :</strong> {row.function}<br /></> )}
          {row.module && ( <><strong>Module :</strong> {row.module}<br /></> )}
        </div>
      </TableCell>
      <TableCell>
        {row.payload && (
          <div className={cellScrollClass}>
            <strong>Payload :</strong>

            <div className="mt-2 space-y-1">
              {Object.entries(row.payload).map(([key, value]) => (
                <div key={key}> <strong>{key}:</strong>{" "} {typeof value === "object" ? JSON.stringify(value) : String(value)} </div> ))}
            </div>
          </div>
        )}
      </TableCell>

      <TableCell><div className={cellScrollClass}>{row.message && row.message}</div></TableCell>
      <TableCell>
        <div className="space-y-2">
          <UserRow row={row.user_id as UserRowProps} />

          <div className="text-sm text-muted-foreground">
            {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "N/A"}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Trash2 className="h-4 w-4 cursor-pointer text-red-500 hover:text-red-600" onClick={() => onDelete(row._id.toString())}/>
      </TableCell>
    </TableRow>
  );
}
