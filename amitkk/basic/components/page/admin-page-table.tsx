import mongoose, {Types} from 'mongoose';
import {useState, useCallback} from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, {menuItemClasses} from '@mui/material/MenuItem';
import DateFormat from '@amitkk/basic/components/static/date-format';
import MetaTableInput, { MetaTableProps } from '@amitkk/basic/components/static/meta-table-input';
import MediaImage from '@amitkk/basic/components/static/table-image';
import { Iconify, TableRowPropsBase } from '@amitkk/basic/utils/utils';
import Link from 'next/link';
import { MediaProps } from '@amitkk/basic/types/page';

export type DataProps = {
  _id: string | Types.ObjectId;
  name: string;
  url: string;
  status: boolean;
  schema_status: boolean;
  sitemap: boolean;
  media_id: string | Types.ObjectId | MediaProps;
  meta_id: MetaTableProps;
  createdAt: string | Date;
  updatedAt: Date;
};

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
        <TableCell><Link href={`/${row.url}`} target="_blank">{row.name}<br/>{row.url}</Link></TableCell>
        <TableCell><MediaImage media={row.media_id as MediaProps}/></TableCell>
        <TableCell>
          Status - { row.status ? 'Yes' : 'no' }<br/>
          Schema - { row.schema_status ? 'Yes' : 'No' }<br/>
          Sitemap - { row.sitemap ? 'Yes' : 'no' }
        </TableCell>
        <TableCell><MetaTableInput title={row.meta_id?.title}  description={row.meta_id?.description}/></TableCell>
        <TableCell><DateFormat date={row.createdAt} /></TableCell>
        <TableCell align='right'>
          <IconButton id={row._id.toString()} onClick={handleOpenPopover}><Iconify icon='Edit'/></IconButton>
        </TableCell>
      </TableRow>

      <Popover open={!!openPopover} anchorEl={openPopover} onClose={handleClosePopover} anchorOrigin={{vertical: 'top', horizontal: 'left'}} transformOrigin={{vertical: 'top', horizontal: 'right'}}>
              <MenuList disablePadding sx={{ p: 0.5, gap: 0.5, width: 140, display: 'flex', flexDirection: 'column', [`& .${menuItemClasses.root}`]: { px: 1, gap: 2, borderRadius: 0.75, [`&.${menuItemClasses.selected}`]: {bgcolor: 'action.selected'} } }}>
                <MenuItem><Link href={`/admin/add-update-page/${row._id}`}><Iconify icon='Edit' />Edit</Link></MenuItem>
                <MenuItem><Link href={`/admin/faqs/Page/${row._id}`} target="_blank"><Iconify icon='Edit' />FAQs</Link></MenuItem>
                <MenuItem><Link href={`/admin/testimonials/Page/${row._id}`} target="_blank"><Iconify icon='Edit' />Testimonial</Link></MenuItem>
              </MenuList>
            </Popover>
    </>
  );
}
