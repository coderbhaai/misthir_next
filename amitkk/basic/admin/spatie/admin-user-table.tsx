import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { TableCell, TableRow } from '@amitkk/components/basic/table';
import { ActionCell } from "@amitkk/components/basic/ActionCell";
import { UserProps } from '@amitkk/basic/types/user';
import AdminRowActions from '@amitkk/components/admin/AdminRowActions';

type Props = {
  row: UserProps;
  onEdit: (row: UserProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  const permissionsList = row.permissions ?? [];
  const hasPermissions = permissionsList.length > 0;
  const isSeller = (row.roles ?? []).some((role) => role.name?.toLowerCase() === 'seller');

  useEffect(() => {
    const element = textRef.current;
    if (element) {
      const hasOverflow = element.scrollHeight > element.clientHeight;
      setIsOverflowing(hasOverflow);
    }
  }, [permissionsList, isExpanded]);

  const rowActions = [
    { label: "Edit", onClick: () => onEdit(row) },
    ...(isSeller ? [{ label: "Service Areas", href: `/admin/seller-service-areas/${row._id}` }] : []),
  ];

  return (
    <>
      <TableRow>
        <TableCell>{row.name}</TableCell>
        <TableCell>{row.email}</TableCell>
        <TableCell>{row.phone}</TableCell>
        <TableCell>{(row.roles ?? [])?.map((m, i, arr) => ( <span key={m._id} style={{ marginRight: '10px' }}>{m.name ?? ''} {i < arr.length - 1 && ','}</span> ))}</TableCell>
        <TableCell className="max-w-[600px]">
          {hasPermissions ? (
            <div className="flex flex-col items-start w-[600px] max-w-[600px] min-w-0">
              <div ref={textRef} className={`w-full min-w-0 break-words whitespace-normal ${isExpanded ? "" : ""}`}>
                {permissionsList.map((m, i, arr) => ( <span key={m._id} className="inline mr-1">{m.name}{i < arr.length - 1 ? ',' : ''}</span> ))}
              </div>
              {(isOverflowing || isExpanded) && (
                <button type="button" onClick={() => setIsExpanded(!isExpanded)} className="text-xs text-blue-600 hover:text-blue-800 font-semibold focus:outline-none mt-1 whitespace-nowrap">{isExpanded ? "Show Less" : "Show More"}</button>
              )}
            </div>
          ) : (null)}
        </TableCell>
        <ActionCell row={row} modelName="User" usePopover/>
      </TableRow>

      <AdminRowActions id={row._id.toString()} actions={rowActions}/>
    </>
  );
}