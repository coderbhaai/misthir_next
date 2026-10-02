'use client'

import { TableCell, TableRow } from '@amitkk/components/basic/table';
import { StateProps } from '@amitkk/address/types';  
import { isPopulatedCountryProps } from '../utils/addressUtils';
import { ActionCell } from '@amitkk/components/basic/ActionCell';

type Props = {
  row: StateProps;
  onEdit: (row: StateProps) => void;
};

export function AdminDataTable({ row, onEdit}: Props) {
  return (
    <TableRow>
      <TableCell>{isPopulatedCountryProps(row.country_id) ? row.country_id.name : '-'}</TableCell>
      <TableCell>{row.name}</TableCell>
      <ActionCell row={row} modelName="" onEdit={onEdit}/>
    </TableRow>
  );
}