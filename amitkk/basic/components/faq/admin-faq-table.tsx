"use client";

import {useState, useCallback} from 'react';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import MenuItem, {menuItemClasses} from '@mui/material/MenuItem';
import { Link } from '@mui/material';
import { Iconify, TableRowPropsBase } from '@amitkk/basic/utils/utils';
import StatusSwitch from '@amitkk/basic/components/static/status-switch';
import { Types } from 'mongoose';
import { FaqProps } from '@amitkk/basic/types/page';

export interface DataProps extends FaqProps {
    function: string;
    module: string;
    module_id: string | Types.ObjectId;
    selectedDataId: string | Number | object | null;
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
        <TableCell>{row.module}</TableCell>
        <TableCell>
          { row.module === "Blog" ? ( <Link href={`/blog/${(row.module_id as any).url}`} target="_blank">{(row.module_id as any).name}</Link>) : null }
          { row.module === "Page" ? ( <Link href={`/${(row.module_id as any).url}`} target="_blank">{(row.module_id as any).name}</Link>) : null }
        </TableCell>
        <TableCell>{row.question}</TableCell>
        <TableCell><StatusSwitch id={row._id.toString()} status={row.status} modelName="Faq"/></TableCell>
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
