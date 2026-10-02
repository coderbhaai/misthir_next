'use client'

import { AddressProps } from '@amitkk/address/types';
import { fullAddress } from '@amitkk/address/utils/addressUtils';
import UserRow from '@amitkk/basic/static/UserRow';
import { UserRowProps } from '@amitkk/basic/types/user';
import { ActionCell } from '@amitkk/components/basic/ActionCell';
import { TableCell, TableRow } from '@amitkk/components/basic/table';

export interface DataProps extends AddressProps {
  city_new: string;
  country_id: string;
  state_id: string;
};

type Props = {
  row: DataProps;
  onEdit: (row: DataProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <TableRow>
      <TableCell><UserRow row={row.user_id as UserRowProps}/></TableCell>
      <TableCell>{fullAddress(row)}</TableCell>
      <ActionCell row={row} modelName="Address" onEdit={onEdit}/>
    </TableRow>
  );
}