import {useState, useCallback} from 'react';
import { TableCell, TableRow } from '@amitkk/components/basic/table';
import MediaImage from '@amitkk/components/admin/table-image';
import { MediaProps } from '@amitkk/basic/types/page';
import { ActionCell } from '@amitkk/components/basic/ActionCell';

export type DataProps = {
  function: string;
  name: string;
  status: boolean;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  media_id: string | MediaProps;
  _id: string;
  selectedDataId: string | number | object | null;
};

type Props = {
  row: DataProps;
  onEdit: (row: DataProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <>
      <TableRow>
        <TableCell>{row.name}</TableCell>
        <TableCell><MediaImage media={row.media_id as MediaProps}/></TableCell>
        <ActionCell row={row} modelName="ProductSpecification" onEdit={onEdit}/>
      </TableRow>
    </>
  );
}
