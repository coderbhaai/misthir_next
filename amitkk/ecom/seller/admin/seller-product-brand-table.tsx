import { TableCell, TableRow } from '@amitkk/components/basic/table';
import MediaImage from '@amitkk/components/admin/table-image';
import { MediaProps } from '@amitkk/basic/types/page';
import { DataProps } from '@amitkk/product/admin/admin-product-brand-table';
import { ActionCell } from '@amitkk/components/basic/ActionCell';

type Props = {
  row: DataProps;
  onEdit: (row: DataProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {

  return (
    <>
      <TableRow>
        <TableCell>{row.name}<br/>{row.url}</TableCell>
        <TableCell><MediaImage media={row.media_id as MediaProps}/></TableCell>
        <ActionCell row={row} modelName="ProductBrand" onEdit={onEdit}/>
      </TableRow>
    </>
  );
}
