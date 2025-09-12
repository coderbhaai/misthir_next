import {Types} from 'mongoose';
import {useState, useCallback} from 'react';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import MenuItem, {menuItemClasses} from '@mui/material/MenuItem';
import MetaTableInput from '@amitkk/basic/components/static/meta-table-input';
import { Iconify, TableRowPropsBase } from '@amitkk/basic/utils/utils';
import MediaImage from '@amitkk/basic/components/static/table-image';
import Link from 'next/link';
import DateFormat from '@amitkk/basic/components/static/date-format';
import { Box, IconButton, Typography } from '@mui/material';
import { MediaProps, MetaTableProps } from '@amitkk/basic/types/page';
import { GenericPills } from '@amitkk/basic/components/static/generic-pills';
import UserRow from '@amitkk/basic/static/UserRow';
import { UserRowProps } from '@amitkk/blog/types/blog';
import { CartProps } from '../types/ecom';
import { ProductProps, SkuProps } from '@amitkk/product/types/product';

export interface DataProps extends CartProps{

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
        <TableCell><UserRow row={row.user_id as unknown as UserRowProps}/></TableCell>
        <TableCell>
          Total : {row.total?.$numberDecimal}<br/>
          Payable : {row.payable_amount?.$numberDecimal}<br/>
        </TableCell>

        <TableCell>
          {row.cartSkus?.map((i) => {
            const product = i.product_id as ProductProps;
            const sku = i.sku_id as SkuProps;

            return (
              <div key={i._id?.toString()}>
                {product?.name} : {i.quantity} X {sku?.price} ={" "}
                {sku?.price ? i.quantity * Number(sku.price) : null}
              </div>
            );
          })}
        </TableCell>

        <TableCell>
          {row.cartCharges && (
            <>
              {row.cartCharges.shipping_charges && (
                <div>Shipping Charges : {row.cartCharges.shipping_charges?.toString()}</div>
              )}
              {row.cartCharges.shipping_chargeable_value && (
                <div>Shipping Chargeable Value : {row.cartCharges.shipping_chargeable_value}</div>
              )}
              {row.cartCharges.sales_discount && (
                <div>Sales Discount : {row.cartCharges.sales_discount}</div>
              )}
              {row.cartCharges.admin_discount && (
                <div>Admin Discount : {row.cartCharges.admin_discount}</div>
              )}
              {row.cartCharges.cod_charges && (
                <div>COD Charges : {row.cartCharges.cod_charges?.toString()}</div>
              )}
            </>
          )}
        </TableCell>
        <TableCell><DateFormat date={row.createdAt} /></TableCell>
        <TableCell align='right'><IconButton id={row._id.toString()} onClick={handleOpenPopover}><Iconify icon='Edit'/></IconButton></TableCell>
      </TableRow>

      <Popover open={!!openPopover} anchorEl={openPopover} onClose={handleClosePopover} anchorOrigin={{vertical: 'top', horizontal: 'left'}} transformOrigin={{vertical: 'top', horizontal: 'right'}}>
        <MenuList disablePadding sx={{ p: 0.5, gap: 0.5, width: 140, display: 'flex', flexDirection: 'column', [`& .${menuItemClasses.root}`]: { px: 1, gap: 2, borderRadius: 0.75, [`&.${menuItemClasses.selected}`]: {bgcolor: 'action.selected'} } }}>
          <MenuItem><Link href={`/admin/abandoned-cart/${row._id}`}><Iconify icon='Edit' />Edit</Link></MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}
