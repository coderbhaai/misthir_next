import { TableCell, TableRow } from '@amitkk/components/basic/table';
import MediaImage from '@amitkk/components/admin/table-image';
import { Iconify } from "@amitkk/basic/utils/my-utils/admin-utils";
import type { MediaProps } from '@amitkk/basic/types/media';
import ModuleLink from '@amitkk/basic/static/ModuleLink';
import { useCallback, useState } from 'react';
import BlockDetailModal from '@amitkk/blocks/admin/block-detail-modal';
import { BlockDetailProps } from '@amitkk/basic/types/blocks';
import StatusSwitch from '@amitkk/components/admin/status-switch';

export interface DataProps extends BlockDetailProps {
}

type Props = {
  row: DataProps;
  onEdit: (row: DataProps) => void;
};

export function AdminDataTable({ row, onEdit}: Props) {  
   const [selectedRow, setSelectedRow] = useState<BlockDetailProps | null>(null);
    const handleOpenBlockDetail = useCallback((row: DataProps) => {
      setSelectedRow(row);
    }, []);
    
  return (
    <TableRow>
      <TableCell>{row.module}</TableCell>
      <TableCell><ModuleLink module={row.module} module_url={(row.module_id as any).url} module_name={(row.module_id as any).name}/></TableCell>
      <TableCell>{row.block_id}</TableCell>
      <TableCell>{row.heading}</TableCell>
      <TableCell><MediaImage media={row.media_id as MediaProps} style={{ marginBottom: 3 }}/></TableCell>
      <TableCell><StatusSwitch id={row?._id.toString()} status={row.status} modelName="BlockDetail"/></TableCell>
      <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
      <TableCell align='right'><Iconify icon='Edit' onClick={() => handleOpenBlockDetail(row)}/></TableCell>
      {selectedRow && (
        <BlockDetailModal handleClose={() => { setSelectedRow(null); }} selectedData={selectedRow} handleUpdate={onEdit}/>
      )}
    </TableRow>
  );
}