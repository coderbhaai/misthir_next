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
import { Box, Card, CardContent, IconButton, Typography } from '@mui/material';
import { MediaProps, MetaTableProps } from '@amitkk/basic/types/page';
import { ProductProps } from '@amitkk/product/types/product';
import { GenericPills } from '@amitkk/basic/components/static/generic-pills';
import { ProductRawDocument } from 'lib/models/types';
import { MediaCards } from '@amitkk/basic/components/static/MediaCards';
import StatusSwitch from '@amitkk/basic/components/static/status-switch';
import { MetaRow } from '@amitkk/basic/components/static/MetaRow';

export interface DataProps extends ProductRawDocument {
  selectedDataId: string | number | object | null;
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
        <TableCell><Link href={`/${row.url}`} target="_blank">{row.name}<br/>{row.url}</Link></TableCell>
        <TableCell>{row.dietary_type}</TableCell>
        <TableCell>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {["Category", "Tag", "Type"].map((module) => (
              <MetaRow key={module} label={module} items={row.metas?.filter((m) => m.module === module)} basePath="/product-meta"/>
            ))}
            <MetaRow label="Ingridients" items={row.ingridients} clickable={false} />
            <MetaRow label="Brands" items={row.brands} basePath="/product-brand" />
          </Box>
        </TableCell>

        <TableCell>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {row.skus?.map((i) => (
              <Box
                key={i._id.toString()}
                p={2}
                border="1px solid #ddd"
                borderRadius="8px"
                sx={{
                  backgroundColor: "background.paper",
                  "&:hover": { backgroundColor: "action.hover" },
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start"mb={1}>
                  <Box flexGrow={1}>
                    <Typography variant="h6" gutterBottom>{i.name}</Typography>
                    <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={1}>
                      <Typography variant="body2"><strong>Price:</strong> ₹{i.price}</Typography>
                      <Typography variant="body2"><strong>Inventory:</strong> {i.inventory}</Typography>
                      <Typography variant="body2"><strong>Weight:</strong> {i.details?.weight || 0} units</Typography>
                      <Typography variant="body2"><strong>Dimensions:</strong> {i.details?.length || 0}L X {" "}{i.details?.width || 0}W × {i.details?.height || 0}H</Typography>
                      <Typography variant="body2"><strong>Prep Time:</strong> {i.details?.preparationTime || 0}{" "}mins</Typography>
                      <Typography variant="body2"><strong>Display Order:</strong> {i.displayOrder || 0}</Typography>
                      <MetaRow label="Flavors" items={i.flavors} basePath="/flavor" />
                      <MetaRow label="Colors" items={i.colors} basePath="/color" />
                    </Box>
                  </Box>
                </Box>
                {!i.status && ( <Typography variant="caption" color="error">Inactive</Typography> )}
              </Box>
            ))}
          </Box>
        </TableCell>
        <TableCell><MediaCards items={row.medias} height = {50} width ={60} /></TableCell>
        <TableCell><StatusSwitch id={row._id.toString()} status={row.status} modelName="Product"/></TableCell>
        <TableCell align='right'><IconButton id={row._id.toString()} onClick={handleOpenPopover}><Iconify icon='Edit'/></IconButton></TableCell>
      </TableRow>

      <Popover open={!!openPopover} anchorEl={openPopover} onClose={handleClosePopover} anchorOrigin={{vertical: 'top', horizontal: 'left'}} transformOrigin={{vertical: 'top', horizontal: 'right'}}>
        <MenuList disablePadding sx={{ p: 0.5, gap: 0.5, width: 140, display: 'flex', flexDirection: 'column', [`& .${menuItemClasses.root}`]: { px: 1, gap: 2, borderRadius: 0.75, [`&.${menuItemClasses.selected}`]: {bgcolor: 'action.selected'} } }}>
          <MenuItem><Link href={`/admin/seller/add-update-product/${row._id}`}><Iconify icon='Edit' />Edit</Link></MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}
