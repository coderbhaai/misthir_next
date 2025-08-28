import {Types} from 'mongoose';
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
import { LogoPortfolioProps } from '@amitkk/agency/types';
import { MediaProps } from '@amitkk/basic/types/page';
import UserRow from '@amitkk/basic/static/UserRow';
import { UserRowProps } from '@amitkk/blog/types/blog';

export interface DataProps extends LogoPortfolioProps {
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
        <TableCell><UserRow row={row.client_id as unknown as UserRowProps}/></TableCell>
        <TableCell><MediaImage media={row.media_id as MediaProps}/></TableCell>
        <TableCell><StatusSwitch id={row._id.toString()} status={row.status} modelName="LogoPortfolio"/></TableCell>
        <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
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
