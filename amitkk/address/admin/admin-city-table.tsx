'use client'

import { TableCell, TableRow } from '@amitkk/components/basic/table';
import { CityProps } from '@amitkk/address/types';
import { ActionCell } from '@amitkk/components/basic/ActionCell';
import { getProp } from '@amitkk/basic/utils/my-utils/shared-utils';

type Props = {
  row: CityProps;
  onEdit: (row: CityProps) => void;};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <TableRow>
      <TableCell>{getProp(row.country_id, "name")}</TableCell>
      <TableCell>{getProp(row.state_id, "name")}</TableCell>
      <TableCell>{row.name}</TableCell>
      <ActionCell row={row} modelName="City" onEdit={onEdit}/>
    </TableRow>
  );
}