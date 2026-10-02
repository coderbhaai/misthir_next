import { TableCell, TableRow } from '@amitkk/components/basic/table';
import MediaImage from '@amitkk/components/admin/table-image';
import MetaTableInput from '@amitkk/components/admin/meta-table-input';
import { ProductBrandProps } from '../types';
import UserRow from '@amitkk/basic/static/UserRow';
import { UserRowProps } from '@amitkk/basic/types/user';
import { ActionCell } from '@amitkk/components/basic/ActionCell';
import { MediaProps } from '@amitkk/basic/types/media';

export interface DataProps extends ProductBrandProps {
  title: string;
  description: string;
};

type Props = {
  row: DataProps;
  onEdit: (row: DataProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <>
      <TableRow>
        <TableCell>{row.name}<br/>{row.url}</TableCell>
        <TableCell><UserRow row={row.seller_id as unknown as UserRowProps}/></TableCell>
        <TableCell><MediaImage media={row.media_id as MediaProps}/></TableCell>
        <TableCell><MetaTableInput meta={row.meta_id} /></TableCell>
        <ActionCell row={row} modelName="ProductBrand" onEdit={onEdit}/>
      </TableRow>
    </>
  );
}
