import {Types} from 'mongoose';
import {useState, useCallback} from 'react';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, {menuItemClasses} from '@mui/material/MenuItem';
import { TableRowPropsBase, Iconify } from '@amitkk/basic/utils/utils';
import { MediaProps } from '@amitkk/basic/types/page';

export type DataProps = {
  function: string;
  alt: string;
  path?: string;
  createdAt?: string | Date;
  updatedAt?: Date;
  media_id?: string | Types.ObjectId | MediaProps;
  _id: string | Types.ObjectId;
  selectedDataId: string | number | object | null;
};

type UserTableRowProps = TableRowPropsBase & {
  row: DataProps;
  onEdit: (row: DataProps) => void;
};

export function AdminDataTable({showCheckBox, row, selected, onSelectRow, onEdit}: UserTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const handlePopover = useCallback( (e: React.MouseEvent<HTMLButtonElement> | null) => setOpenPopover(e?.currentTarget || null), [] );

  return (
    <>
      <TableRow hover tabIndex={-1} role='checkbox' selected={selected}>
        { showCheckBox ? <TableCell padding='checkbox'><Checkbox disableRipple checked={selected} onChange={onSelectRow}/></TableCell> : null }
        <TableCell><img src={typeof row.media_id === 'object' && 'path' in row.media_id? row.media_id.path: row.path || '/placeholder.jpg'} style={{ width: "48px", height: "48px", objectFit: "cover" }} /></TableCell>
        <TableCell>{row.alt}</TableCell>
        <TableCell>{row.path}</TableCell>
        <TableCell>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
        <TableCell align='right'>
          <IconButton id={row._id.toString()} onClick={(e) => handlePopover(e)}><Iconify icon='Edit'/></IconButton>
        </TableCell>
      </TableRow>

      <Popover open={!!openPopover} anchorEl={openPopover} onClick={() => handlePopover(null)} anchorOrigin={{vertical: 'top', horizontal: 'left'}} transformOrigin={{vertical: 'top', horizontal: 'right'}}>
        <MenuList disablePadding sx={{ p: 0.5, gap: 0.5, width: 140, display: 'flex', flexDirection: 'column', [`& .${menuItemClasses.root}`]: { px: 1, gap: 2, borderRadius: 0.75, [`&.${menuItemClasses.selected}`]: {bgcolor: 'action.selected'} } }}>
          <MenuItem onClick={() => onEdit(row)}><Iconify icon='Edit' />Edit</MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}
