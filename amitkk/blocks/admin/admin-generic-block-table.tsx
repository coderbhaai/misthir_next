import { useState, useCallback } from 'react';
import { TableCell, TableRow } from '@amitkk/components/basic/table';
import MediaImage from '@amitkk/components/admin/table-image';
import BlockDetailModal from './block-detail-modal';
import ModuleLink from '@amitkk/basic/static/ModuleLink';
import { ActionCell } from "@amitkk/components/basic/ActionCell";
import AdminRowActions from '@amitkk/components/admin/AdminRowActions';
import type { SingleGenericBlockProps } from '@amitkk/blocks/types';
import type { MediaProps } from '@amitkk/basic/types/media';
import { apiRequest, hitToastr } from '@amitkk/basic/utils/my-utils/admin-utils';

type Props = {
  row: SingleGenericBlockProps;
  onEdit: (row: SingleGenericBlockProps) => void;
};

export const block_count = 20;
const blockOptions = Array.from({ length: block_count }, (_, i) => `${i + 1}`);

export function AdminDataTable({ row, onEdit }: Props) {
  const [selectedRow, setSelectedRow] = useState<SingleGenericBlockProps | null>(null);
  const [blockId, setBlockId] = useState(row.block_id || '');
  const [updating, setUpdating] = useState(false);

  const handleOpenBlockDetail = useCallback((row: SingleGenericBlockProps) => { setSelectedRow(row); }, []);

  const handleUpdateBlockId = async () => {
    try {
      setUpdating(true);
      const res = await apiRequest("POST", "block/genericBlock", {
        function: "update_block_id",
        _id: row._id,
        block_id: blockId,
      });
      if (res?.data) {
        hitToastr('success', res?.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <TableRow>
        <TableCell>{row.module}</TableCell>
        <TableCell><ModuleLink module={row.module} module_url={(row.module_id as any)?.url} module_name={(row.module_id as any)?.name}/></TableCell>
        <TableCell>
          <div className="flex items-center gap-2 cursor-pointer">
            <select value={blockId} onChange={(e) => setBlockId(e.target.value)} className="rounded px-2 py-1 text-sm bg-transparent cursor-pointer">
              <option value="" disabled>Select Block</option>
              {blockOptions.map((opt) => ( <option key={opt} value={opt}>{opt}</option> ))}
            </select>
            <button onClick={handleUpdateBlockId} disabled={updating || blockId === row.block_id?.toString()} className="px-2 py-1 text-xs bg-primary text-white rounded disabled:opacity-50">{updating ? 'Saving...' : 'Save'}</button>
          </div>
        </TableCell>
        <TableCell>{row.heading}</TableCell>
        <TableCell>
          <MediaImage media={row.media_id as MediaProps} style={{ marginBottom: 3 }}/>
          <MediaImage media={row.mobile_media_id as MediaProps}/>
        </TableCell>
        <ActionCell row={row} modelName="GenericBlock" usePopover/>
      </TableRow>

      <AdminRowActions id={row._id.toString()} actions={[
        { label: "Edit", onClick: () => onEdit(row), },
        { label: "Block Detail", onClick: () => handleOpenBlockDetail(row), },
      ]}/>

      {selectedRow && (
        <BlockDetailModal handleClose={() => { setSelectedRow(null); }} selectedData={selectedRow} handleUpdate={() => { setSelectedRow(null); }}/>
      )}
    </>
  );
}