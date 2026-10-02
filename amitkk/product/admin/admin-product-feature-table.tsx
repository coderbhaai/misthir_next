import { TableCell, TableRow } from '@amitkk/components/basic/table';
import MediaImage from '@amitkk/components/admin/table-image';
import { ProductFeatureProps } from '../types';
import MetaTableInput from '@amitkk/components/admin/meta-table-input';
import { ActionCell } from '@amitkk/components/basic/ActionCell';
import { MediaProps } from '@amitkk/basic/types/media';

export interface DataProps extends ProductFeatureProps {
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
        <TableCell>{row.module}<br/>{row.module_value}</TableCell>
        <TableCell>{row.name}</TableCell>
        <TableCell><MediaImage media={row.media_id as MediaProps}/></TableCell>
        <TableCell><MetaTableInput meta={row.meta_id} /></TableCell>
        <ActionCell row={row} modelName="ProductFeature" onEdit={onEdit}/>
      </TableRow>
    </>
  );
}
