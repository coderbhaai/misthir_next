import {useState, useCallback} from 'react';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import MenuItem, {menuItemClasses} from '@mui/material/MenuItem';
import { Iconify, TableRowPropsBase } from '@amitkk/basic/utils/utils';
import StatusSwitch from '@amitkk/basic/components/static/status-switch';
import UserRow from '@amitkk/basic/static/UserRow';
import { UserRowProps } from '@amitkk/blog/types/blog';
import type {DataProps} from '@amitkk/basic/components/spatie/admin-user-table';

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
        <TableCell><UserRow row={row as unknown as UserRowProps}/></TableCell>
        <TableCell>
          {(row.roles ?? [])?.map((m, i, arr) => (
            <span key={m._id} style={{ marginRight: '10px' }}>{m?.name ?? ''} {i < arr.length - 1 && ','}</span>
          ))}
        </TableCell>
        <TableCell>
          {(row.permissions ?? [])?.map((m, i, arr) => (
            <span key={m._id} style={{ marginRight: '10px' }}>{m.name ?? ''} {i < arr.length - 1 && ','}</span>
          ))}
        </TableCell>
        <TableCell><StatusSwitch id={row._id.toString()} status={row.status} modelName="User"/></TableCell>
        <TableCell>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A' }</TableCell>
        <TableCell align='right'><MenuItem onClick={() => onEdit(row)}><Iconify icon='Edit' />Edit</MenuItem></TableCell>
      </TableRow>

      <Popover open={!!openPopover} anchorEl={openPopover} onClick={() => handlePopover(null)} anchorOrigin={{vertical: 'top', horizontal: 'left'}} transformOrigin={{vertical: 'top', horizontal: 'right'}}>
        <MenuList disablePadding sx={{ p: 0.5, gap: 0.5, width: 140, display: 'flex', flexDirection: 'column', [`& .${menuItemClasses.root}`]: { px: 1, gap: 2, borderRadius: 0.75, [`&.${menuItemClasses.selected}`]: {bgcolor: 'action.selected'} } }}>
          <MenuItem onClick={() => onEdit(row)}><Iconify icon='Edit' />Edit</MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}
