import { TableCell, TableRow } from '@amitkk/components/basic/table';
import { SingleBlogMetaProps } from '../types';
import { ActionCell } from "@amitkk/components/basic/ActionCell";
import MetaTableInput from '@amitkk/components/admin/meta-table-input';

export interface DataProps extends SingleBlogMetaProps{
  title: string;
  description: string;
};

type Props = {
  row: DataProps;
  onEdit: (row: DataProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <TableRow>
      <TableCell>{row.type ? row.type.charAt(0).toUpperCase() + row.type.slice(1) : ""}</TableCell>
      <TableCell>{row.name}</TableCell>
      <TableCell>{row.url}</TableCell>
      <TableCell><MetaTableInput meta={row.meta_id} /></TableCell>
      <ActionCell row={row} modelName="Blogmeta" onEdit={onEdit}/>
    </TableRow>
  );
}
