import { TableCell, TableRow } from '@amitkk/components/basic/table';
import MediaImage from '@amitkk/components/admin/table-image';
import type { MediaProps } from '@amitkk/basic/types/media';
import ModuleLink from '@amitkk/basic/static/ModuleLink';
import { BlockquoteProps } from '../types';
import { ActionCell } from "@amitkk/components/basic/ActionCell";

export interface DataProps extends BlockquoteProps {
}

type Props = {
  row: DataProps;
  onEdit: (row: DataProps) => void;
};

export function AdminDataTable({ row, onEdit}: Props) {  
  return (
    <TableRow>
      <TableCell>{row.module}</TableCell>
      <TableCell><ModuleLink module={row.module} module_url={(row.module_id as any).url} module_name={(row.module_id as any).name}/></TableCell>
      <TableCell>{row.heading}</TableCell>
      <TableCell><MediaImage media={row.media_id as MediaProps} style={{ marginBottom: 3 }}/></TableCell>
      <ActionCell row={row} modelName="BlockQuote" onEdit={onEdit}/>
    </TableRow>
  );
}
