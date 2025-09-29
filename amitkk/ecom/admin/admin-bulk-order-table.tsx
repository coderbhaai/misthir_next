import {useState, useCallback} from 'react';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import MenuItem, {menuItemClasses} from '@mui/material/MenuItem';
import { Iconify, TableRowPropsBase } from '@amitkk/basic/utils/utils';
import Link from 'next/link';
import DateFormat from '@amitkk/basic/components/static/date-format';
import { IconButton } from '@mui/material';
import UserRow from '@amitkk/basic/static/UserRow';
import { UserRowProps } from '@amitkk/blog/types/blog';
import { BulkProps } from '../types/ecom';

export interface DataProps extends BulkProps{
}

type UserTableRowProps = TableRowPropsBase & {
  row: DataProps;
  onEdit: (row: DataProps) => void;
};

export function AdminDataTable({showCheckBox, row, selected, onSelectRow, onEdit}: UserTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  return (
    <>
      <TableRow hover tabIndex={-1} role='checkbox' selected={selected}>
        { showCheckBox ? <TableCell padding='checkbox'><Checkbox disableRipple checked={selected} onChange={onSelectRow}/></TableCell> : null }
        <TableCell><UserRow row={row as unknown as UserRowProps}/></TableCell>
        <TableCell><UserRow row={row.vendor_id as unknown as UserRowProps}/></TableCell>
        <TableCell>
          {row?.product_id && (row.product_id as any)?.name ? (
            <Link href={`/product/${(row.product_id as any)?.url}`} passHref>{(row.product_id as any)?.name}</Link>
          ) : ( "" )}
        </TableCell>
        <TableCell>{row.quantity}</TableCell>
        <TableCell>
          {row.user_remarks && ( <><strong>User:</strong> {row.user_remarks}<br/></> )}
          {row.admin_remarks && ( <><strong>Admin:</strong> {row.admin_remarks}<br/></> )}
          {row.vendor_remarks && ( <><strong>Vendor:</strong> {row.vendor_remarks}</> )}
        </TableCell>
        <TableCell><DateFormat date={row.createdAt} /></TableCell>
        <TableCell align='right'><IconButton id={row._id.toString()} onClick={handleOpenPopover}><Iconify icon='Edit'/></IconButton></TableCell>
      </TableRow>

      <Popover open={!!openPopover} anchorEl={openPopover} onClose={handleClosePopover} anchorOrigin={{vertical: 'top', horizontal: 'left'}} transformOrigin={{vertical: 'top', horizontal: 'right'}}>
        <MenuList disablePadding sx={{ p: 0.5, gap: 0.5, width: 140, display: 'flex', flexDirection: 'column', [`& .${menuItemClasses.root}`]: { px: 1, gap: 2, borderRadius: 0.75, [`&.${menuItemClasses.selected}`]: {bgcolor: 'action.selected'} } }}>
          <MenuItem onClick={() => onEdit(row)}><Iconify/>Check Order</MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}
