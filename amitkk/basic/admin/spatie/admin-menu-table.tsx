import { TableCell, TableRow } from '@amitkk/components/basic/table';
import MediaImage from '@amitkk/components/admin/table-image';
import { ActionCell } from "@amitkk/components/basic/ActionCell";
import type { MenuProps } from '@amitkk/basic/types';
import type { MediaProps } from '@amitkk/basic/types/media';

export interface DataProps extends MenuProps{  
};

type Props = {
  row: DataProps;
  onEdit: (row: DataProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
   <TableRow>
      <TableCell>
        <div style={{ paddingLeft: `${(row.depth ?? 0) * 24}px`, display: "flex", alignItems: "center", gap: 8, }}>
          {row.depth && row.depth > 0 && <span>↳</span>}
          <span>{row.name}</span>
        </div>
      </TableCell>
      <TableCell>{row.url}</TableCell>
      <TableCell><MediaImage media={row.media_id as MediaProps}/></TableCell>
      <TableCell>{row.permission_id?.name}</TableCell>
      <ActionCell row={row} modelName="Menu" onEdit={onEdit}/>
    </TableRow>
  );
}
