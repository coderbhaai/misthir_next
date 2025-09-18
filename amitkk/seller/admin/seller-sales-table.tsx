import {useState, useCallback} from 'react';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import MenuItem, {menuItemClasses} from '@mui/material/MenuItem';
import { Iconify, renderDecimal, TableRowPropsBase } from '@amitkk/basic/utils/utils';
import Link from 'next/link';
import DateFormat from '@amitkk/basic/components/static/date-format';
import { IconButton } from '@mui/material';
import { UserRowProps } from '@amitkk/blog/types/blog';
import { SaleProps } from '@amitkk/ecom/types/ecom';
import UserName from '@amitkk/basic/static/UserName';
import CartChargesDetails from '@amitkk/ecom/admin/CartChargesDetails';
import CartSkuDetails from '@amitkk/ecom/admin/CartSkuDetails';

export interface DataProps extends SaleProps{
  totalSkus: number;
  totalProducts: number;
}

type UserTableRowProps = TableRowPropsBase & {
  row: DataProps;
};

export function AdminDataTable({showCheckBox, row, selected, onSelectRow}: UserTableRowProps) {
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
        <TableCell>{row.name}</TableCell>
        <TableCell><DateFormat date={row.valid_from}/>- <DateFormat date={row.valid_to}/></TableCell>
        <TableCell>{row.type} - {row.type === "Amount Based" ? "₹" : null}{renderDecimal(row.discount)}{row.type === "Percent Based" ? "%" : null}</TableCell>
        <TableCell>{row.totalProducts}</TableCell>
        <TableCell>{row.totalSkus}</TableCell>


        <TableCell align='right'><IconButton id={row._id.toString()} onClick={handleOpenPopover}><Iconify icon='Edit'/></IconButton></TableCell>
      </TableRow>

      <Popover open={!!openPopover} anchorEl={openPopover} onClose={handleClosePopover} anchorOrigin={{vertical: 'top', horizontal: 'left'}} transformOrigin={{vertical: 'top', horizontal: 'right'}}>
        <MenuList disablePadding sx={{ p: 0.5, gap: 0.5, width: 140, display: 'flex', flexDirection: 'column', [`& .${menuItemClasses.root}`]: { px: 1, gap: 2, borderRadius: 0.75, [`&.${menuItemClasses.selected}`]: {bgcolor: 'action.selected'} } }}>
          <MenuItem><Link href={`/seller/add-update-sales/${row._id}`}><Iconify icon='Edit' />Edit</Link></MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}
