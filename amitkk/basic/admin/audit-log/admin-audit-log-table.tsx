import { TableCell, TableRow } from '@amitkk/components/basic/table';
import { AuditLogProps } from '@amitkk/basic/types';
import ModuleLink from '@amitkk/basic/static/ModuleLink';
import React from 'react';
import { Iconify } from '@amitkk/basic/utils/my-utils/admin-utils';
import type { UserRowProps } from '@amitkk/basic/types/user';
import UserRow from '@amitkk/basic/static/UserRow';
import Link from "next/link";

export interface DataProps extends AuditLogProps {
};

type Props = {
  row: DataProps;
};

export function AdminDataTable({ row }: Props) {
  return (
    <>
      <TableRow>
        <TableCell>{row.module}</TableCell>
        <TableCell><ModuleLink module={row.module} module_url={(row.module_id as any)?.url} module_name={(row.module_id as any)?.name}/></TableCell>
        <TableCell><UserRow row={row.user_id as unknown as UserRowProps}/></TableCell>
        <TableCell>
          {row.changes && row.changes.length > 0 ? (
            <span>
              {row.changes.map((change, idx) => (
                <React.Fragment key={idx}>
                  <strong style={{ marginRight: 6 }}>{change.field_name}</strong>{idx < row.changes.length - 1 && ", "}
                </React.Fragment>
              ))}
            </span>
          ) : (
            <em>No changes</em>
          )}
        </TableCell>

        <TableCell>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
        <TableCell align='right'><Link href={`/admin/audit-log/${row._id}`} target="_blank"><Iconify icon='Edit' />Details</Link></TableCell>
      </TableRow>
    </>
  );
}
