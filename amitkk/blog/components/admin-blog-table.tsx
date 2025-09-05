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

export type DataProps = {
  _id: string | Types.ObjectId;
  name: string;
  url: string;
  status: boolean;
  content: string;
  meta_id: MetaTableProps;
  author_id: {
    _id: string | Types.ObjectId;
    name: string;
  };
  metas?: BlogmetaItem[];
  media_id: string | Types.ObjectId | MediaProps;
  createdAt: string | Date;
  updatedAt: Date;
  selectedDataId: string | number | object | null;
};

export type BlogmetaItem = {
  _id: string;
  blog_id: string;
  blogmeta_id: {
    _id: string;
    type: 'category' | 'tag';
    name: string;
    url: string;
  };
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
        <TableCell>
          <Link href={`/${row.url}`} target="_blank">{row.name}<br/>{row.url}</Link>
        </TableCell>
        <TableCell><Link href={`/${row.url}`} target="_blank"><MediaImage media={row.media_id as MediaProps}/></Link></TableCell>
        <TableCell>
          {row.metas?.some(m => m.blogmeta_id.type === 'category') && (
            <div>
              Category:{" "}
              {row.metas.filter(m => m.blogmeta_id.type === 'category')?.map((m) => (
                  <Link key={m.blogmeta_id._id} href={m.blogmeta_id.url} style={{ marginRight: '8px' }}>{m.blogmeta_id.name}</Link>
                ))}
            </div>
          )}
          {row.metas?.some(m => m.blogmeta_id.type === 'tag') && (
            <div>
              Tags:{" "}
              {row.metas.filter(m => m.blogmeta_id.type === 'tag')?.map((m) => (
                  <Link key={m.blogmeta_id._id} href={m.blogmeta_id.url} style={{ marginRight: '8px' }}>{m.blogmeta_id.name}</Link>
              ))}
            </div>
          )}
        </TableCell>

        <TableCell>{row.author_id?.name}</TableCell>
        <TableCell><MetaTableInput meta={row.meta_id} /></TableCell>
        <TableCell><DateFormat date={row.createdAt} /></TableCell>
        <TableCell align='right'><IconButton id={row._id.toString()} onClick={handleOpenPopover}><Iconify icon='Edit'/></IconButton></TableCell>
      </TableRow>

      <Popover open={!!openPopover} anchorEl={openPopover} onClose={handleClosePopover} anchorOrigin={{vertical: 'top', horizontal: 'left'}} transformOrigin={{vertical: 'top', horizontal: 'right'}}>
        <MenuList disablePadding sx={{ p: 0.5, gap: 0.5, width: 140, display: 'flex', flexDirection: 'column', [`& .${menuItemClasses.root}`]: { px: 1, gap: 2, borderRadius: 0.75, [`&.${menuItemClasses.selected}`]: {bgcolor: 'action.selected'} } }}>
          <MenuItem><Link href={`/admin/add-update-blog/${row._id}`}><Iconify icon='Edit' />Edit</Link></MenuItem>
          <MenuItem><Link href={`/admin/faqs/Blog/${row._id}`} target="_blank"><Iconify icon='Edit' />FAQs</Link></MenuItem>
          <MenuItem><Link href={`/admin/testimonials/Blog/${row._id}`} target="_blank"><Iconify icon='Edit' />Testimonial</Link></MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}
