import {Types} from 'mongoose';
import {useState, useCallback} from 'react';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import MenuItem, {menuItemClasses} from '@mui/material/MenuItem';
import StatusSwitch from '@amitkk/basic/components/static/status-switch';
import MediaImage from '@amitkk/basic/components/static/table-image';
import { TableRowPropsBase, Iconify } from '@amitkk/basic/utils/utils';
import { MediaProps } from '@amitkk/basic/types/page';

export type DataProps = {
  function: string;
  name: string;
  url: string;
  permission_id: string;
  status: boolean;
  createdAt: string | Date;
  updatedAt: Date;
  _id: string | Types.ObjectId;
  selectedDataId: string | number | object | null;
  media_id: string | Types.ObjectId | MediaProps;
  menus?:String[]
  menusAttached?: MenuSubmenuItem[];
  selectedMenu?: string[],
  permissionAttached?: { name: string; status?: boolean; _id?: string };
};

export interface MenuSubmenuItem {
  _id: string;
  submenu_id: string;
  menu_id?: {
    _id: string;
    name: string;
  } | null;
}

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
        <TableCell>{row.url}</TableCell>
        <TableCell><MediaImage media={row.media_id as MediaProps}/></TableCell>
        <TableCell>{row.permissionAttached?.name}</TableCell>
        <TableCell><StatusSwitch id={row._id.toString()} status={row.status} modelName="SpatieSubmenu"/></TableCell>
        <TableCell>
          {(row.menusAttached ?? [])?.map((m, i, arr) => (
            <span key={m._id} style={{ marginRight: '10px' }}>
              {m.menu_id?.name ?? ''}
              {i < arr.length - 1 && ','}
            </span>
          ))}
        </TableCell>
        <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
        <TableCell align='right'><MenuItem onClick={() => onEdit(row)}><Iconify/>Edit</MenuItem></TableCell>
      </TableRow>

      <Popover open={!!openPopover} anchorEl={openPopover} onClick={() => handlePopover(null)} anchorOrigin={{vertical: 'top', horizontal: 'left'}} transformOrigin={{vertical: 'top', horizontal: 'right'}}>
        <MenuList disablePadding sx={{ p: 0.5, gap: 0.5, width: 140, display: 'flex', flexDirection: 'column', [`& .${menuItemClasses.root}`]: { px: 1, gap: 2, borderRadius: 0.75, [`&.${menuItemClasses.selected}`]: {bgcolor: 'action.selected'} } }}>
          <MenuItem onClick={() => onEdit(row)}><Iconify/>Edit</MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}
