import {Types} from 'mongoose';
import {useState, useCallback} from 'react';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import MenuItem, {menuItemClasses} from '@mui/material/MenuItem';
import { RolePermissionItem } from './admin-role-table';
import { PermissionRoleItem } from './admin-permission-table';
import { TableRowPropsBase, Iconify } from '@amitkk/basic/utils/utils';
import StatusSwitch from '@amitkk/basic/components/static/status-switch';

export type DataProps = {
  function: string;
  name: string;
  email: string;
  phone: string;
  updatedAt: Date;
  status: boolean;
  createdAt: string | Date;
  _id: string | Types.ObjectId;
  selectedDataId: string | number | object | null;
  permissions?:String[],
  roles?:String[],
  permissionsAttached?: RolePermissionItem[];
  rolesAttached?: PermissionRoleItem[];
  role_child?: string;
  permission_child?: string;
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
        <TableCell>{row.name}</TableCell>
        <TableCell>{row.email}</TableCell>
        <TableCell>{row.phone}</TableCell>
        <TableCell>
          {(row.rolesAttached ?? [])?.map((m, i, arr) => (
            <span key={m._id} style={{ marginRight: '10px' }}>
              {m.role_id?.name ?? ''}
              {i < arr.length - 1 && ','}
            </span>
          ))}
        </TableCell>
        <TableCell>
          {(row.permissionsAttached ?? [])?.map((m, i, arr) => (
            <span key={m._id} style={{ marginRight: '10px' }}>
              {m.permission_id?.name ?? ''}
              {i < arr.length - 1 && ','}
            </span>
          ))}
        </TableCell>
        <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
        <TableCell><StatusSwitch id={row._id.toString()} status={row.status} modelName="User"/></TableCell>
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
