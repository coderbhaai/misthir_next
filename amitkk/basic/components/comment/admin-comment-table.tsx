import {Types} from 'mongoose';
import {useState, useCallback} from 'react';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, {menuItemClasses} from '@mui/material/MenuItem';
import { Link } from '@mui/material';
import StatusSwitch from '@amitkk/basic/components/static/status-switch';
import { TableRowPropsBase, Iconify } from '@amitkk/basic/utils/utils';

export type DataProps = {
  module_id: any;
  module: string;
  name: string;
  email: string;
  content: string;
  status: boolean;
  createdAt: string | Date;
  updatedAt: Date;
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
        <TableCell>
          {row.module}<br/>
          {row.module === "Blog" && ( <Link href={`/blog/${row.module_id.url}`} target="_blank">{row.module_id.name}</Link> )}
        </TableCell>
        <TableCell>{row.name}<br/>{row.email}</TableCell>
        <TableCell>{row.content}</TableCell>
        <TableCell><StatusSwitch id={row._id.toString()} status={row.status} modelName="CommentModel"/></TableCell>
        <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
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
