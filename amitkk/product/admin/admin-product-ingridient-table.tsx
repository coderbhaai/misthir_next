import { TableCell, TableRow } from '@amitkk/components/basic/table';
import MediaImage from '@amitkk/components/admin/table-image';
import { ActionCell } from '@amitkk/components/basic/ActionCell';
import { IngridientProps } from "@amitkk/product/types";
import { MediaProps } from '@amitkk/basic/types/media';

type Props = {
  row: IngridientProps;
  onEdit: (row: IngridientProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <>
      <TableRow>
        <TableCell>{row.name}</TableCell>
        <TableCell><MediaImage media={row.media_id as MediaProps}/></TableCell>
        <ActionCell row={row} modelName="ProductIngridient" onEdit={onEdit}/>
      </TableRow>
    </>
  );
}
