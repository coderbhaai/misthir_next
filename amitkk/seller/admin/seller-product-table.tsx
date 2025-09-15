import {Types} from 'mongoose';
import {useState, useCallback, useEffect} from 'react';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import MenuItem, {menuItemClasses} from '@mui/material/MenuItem';
import MetaTableInput from '@amitkk/basic/components/static/meta-table-input';
import { clo, Iconify, TableRowPropsBase } from '@amitkk/basic/utils/utils';
import MediaImage from '@amitkk/basic/components/static/table-image';
import Link from 'next/link';
import DateFormat from '@amitkk/basic/components/static/date-format';
import { Box, Card, CardContent, CardHeader, Grid, IconButton, Typography } from '@mui/material';
import { MediaProps, MetaTableProps } from '@amitkk/basic/types/page';
import { ProductProps } from '@amitkk/product/types/product';
import { GenericPills } from '@amitkk/basic/components/static/generic-pills';
import { ProductRawDocument } from 'lib/models/types';
import { MediaCards } from '@amitkk/basic/components/static/MediaCards';
import StatusSwitch from '@amitkk/basic/components/static/status-switch';
import { MetaRow } from '@amitkk/basic/components/static/MetaRow';
import { useUserAccess } from 'hooks/useUserSpatie';

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

  const { hasAnyRole, hasPermission } = useUserAccess();

  return (
    <Grid size={12} key={row._id.toString()}>
      <Card sx={{ boxShadow: 3, borderRadius: 2, p: 2 }}>
        <CardHeader title={ <Link href={`/${row.url}`} target="_blank">{row.name}</Link> }subheader={row.url} action={ <IconButton onClick={handleOpenPopover}><Iconify icon='Edit'/></IconButton> }/>
        <Popover open={!!openPopover} anchorEl={openPopover} onClose={handleClosePopover} anchorOrigin={{vertical: 'top', horizontal: 'left'}} transformOrigin={{vertical: 'top', horizontal: 'right'}}>
          
        <MenuList disablePadding sx={{ p: 0.5, gap: 0.5, width: 140, display: 'flex', flexDirection: 'column', [`& .${menuItemClasses.root}`]: { px: 1, gap: 2, borderRadius: 0.75, [`&.${menuItemClasses.selected}`]: {bgcolor: 'action.selected'} } }}>
          {hasAnyRole(["Vendor", "Staff"]) && hasPermission("Product Vendor") &&(
            <MenuItem><Link href={`/seller/add-update-product/${row._id}`}><Iconify icon="Edit"/>Edit</Link></MenuItem>
          )}

          {hasAnyRole(["Owner", "Admin", "SEO"]) && hasPermission("Product Admin") && (
            <MenuItem><Link href={`/admin/add-update-product/${row.vendor_id}/${row._id}`} target="_blank"><Iconify icon="Edit" /> Edit</Link></MenuItem>
          )}

          {hasAnyRole(["Owner", "Admin", "SEO"]) && hasPermission("Page") && (
            <>
              <MenuItem><Link href={`/admin/faqs/Product/${row._id}`} target="_blank"><Iconify icon="Edit" /> FAQs</Link></MenuItem>
              <MenuItem><Link href={`/admin/testimonials/Product/${row._id}`} target="_blank"><Iconify icon="Edit" /> Testimonial</Link></MenuItem>
            </>
          )}
        </MenuList>
      </Popover>
        <CardContent>
          <Typography variant="subtitle2">{row.dietary_type}</Typography>
          <Box sx={{ mt: 2, mb: 2 }}>
            {["Category", "Tag", "Type"].map((module) => (
              <MetaRow key={module} label={module} items={row.metas?.filter((m) => m.module === module)} basePath="/product-meta"/>
            ))}
            <MetaRow label="Ingredients" items={row.ingridients} clickable={false} />
            <MetaRow label="Brands" items={row.brands} basePath="/product-brand" />
          </Box>
          <Box>
            {/* SKUs Section */}
            {row.skus?.map((i) => (
              <Box key={i._id.toString()} mb={2} p={2} border="1px solid #ddd" borderRadius={1} bgcolor="background.paper" sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6">{i.name}</Typography>
                  <Grid container spacing={2}>
                    <Grid size={6}>
                      <Typography variant="body2"><strong>Price:</strong> ₹{i.price}</Typography>
                      <Typography variant="body2"><strong>Inventory:</strong> {i.inventory}</Typography>
                      <Typography variant="body2"><strong>Weight:</strong> {i.details?.weight || 0} units</Typography>
                    </Grid>
                    <Grid size={6}>
                      <Typography variant="body2">
                        <strong>Dimensions:</strong> {i.details?.length || 0}L × {i.details?.width || 0}W × {i.details?.height || 0}H
                      </Typography>
                      <Typography variant="body2"><strong>Prep Time:</strong> {i.details?.preparationTime || 0} mins</Typography>
                      <Typography variant="body2"><strong>Display Order:</strong> {i.displayOrder || 0}</Typography>
                    </Grid>
                  </Grid>
                </Box>
                <MetaRow label="Flavors" items={i.flavors} basePath="/flavor"/>
                <MetaRow label="Colors" items={i.colors} basePath="/color"/>
                {!i.status &&
                  <Typography variant="caption" color="error">Inactive</Typography>
                }
              </Box>
            ))}
          </Box>
          <MediaCards items={row.medias} height={50} width={60} />
          <Box mt={2}>
            <StatusSwitch id={row._id.toString()} status={row.status} modelName="Product" />
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
}
