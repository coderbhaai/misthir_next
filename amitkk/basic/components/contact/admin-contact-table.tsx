import {useState, useCallback} from 'react';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import MenuItem, {menuItemClasses} from '@mui/material/MenuItem';
import MediaImage from '@amitkk/basic/components/static/table-image';
import { Iconify, TableRowPropsBase } from '@amitkk/basic/utils/utils';
import StatusSwitch from '@amitkk/basic/components/static/status-switch';
import UserRow from '@amitkk/basic/static/UserRow';
import { UserRowProps } from '@amitkk/blog/types/blog';
import { ContactProps, MediaProps } from '@amitkk/basic/types/page';
import { Types } from 'mongoose';

export interface DataProps extends ContactProps {
  _id: string | Types.ObjectId;
  function: string;
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
        <TableCell><UserRow row={row as unknown as UserRowProps}/><br/></TableCell>
        <TableCell>{row.status}</TableCell>
        <TableCell>
          {row.user_remarks ? `User: ${row.user_remarks}` : null }<br/>
          {row.admin_remarks ? `Admin: ${row.admin_remarks}` : null }
          </TableCell>
        <TableCell>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
        <TableCell align='right'>
          <MenuItem onClick={() => onEdit(row)}><Iconify icon='Edit' />Edit</MenuItem>
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
