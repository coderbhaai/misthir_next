'use client'

import { TableCell, TableRow } from '@amitkk/components/basic/table';
import { CountryProps } from '@amitkk/address/types';  
import { ActionCell } from '@amitkk/components/basic/ActionCell';

type Props = {
  row: CountryProps;
  onEdit: (row: CountryProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <TableRow>
      <TableCell>{row.name}</TableCell>
      <TableCell>{row.capital}</TableCell>
      <TableCell>{row.code}<br/>{row.calling_code}</TableCell>
      <TableCell>
        <div style={{ display: "inline-block", maxWidth: "40px" }} className="flag-wrapper" dangerouslySetInnerHTML={{ __html: row.flag ?? "" }}/>
      </TableCell>
      <TableCell>{row.site ? "Active" : "Not Active"}</TableCell>
      <ActionCell row={row} modelName="Country" onEdit={onEdit}/>
    </TableRow>
  );
}