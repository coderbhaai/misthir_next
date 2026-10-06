import {useState, useCallback} from 'react';
import Link from 'next/link';
import { ProductRawDocument } from 'lib/models/types';
import { MediaCards } from '@amitkk/components/admin/MediaCards';
import StatusSwitch from '@amitkk/components/admin/status-switch';
import { MetaRow } from '@amitkk/components/admin/MetaRow';
import { useUserAccess } from 'hooks/useUserSpatie';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@amitkk/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@amitkk/components/ui/dropdown-menu';
import { Button } from '@amitkk/components/button/button';
import { Edit, MoreVertical } from 'lucide-react';

export interface DataProps extends ProductRawDocument {
  selectedDataId: string | number | object | null;
}

type Props = {
  row: DataProps;
};

export function AdminDataTable({ row }: Props) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const { hasAnyRole, hasPermission } = useUserAccess();

  return (
    <div className="col-span-12" key={row._id.toString()}>
      <Card className="shadow-md rounded-2xl p-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg font-bold">
              <Link href={`/${row.url}`} target="_blank" className="hover:underline text-primary">{row.name}</Link>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">{row.url}</CardDescription>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px] space-y-1">
              {hasAnyRole(["Vendor", "Staff"]) && hasPermission("Product Vendor") && (
                <DropdownMenuItem asChild>
                  <Link href={`/seller/add-update-product/${row._id}`} className="flex items-center gap-2 cursor-pointer">
                    <Edit className="h-4 w-4" /> Edit
                  </Link>
                </DropdownMenuItem>
              )}

              {hasAnyRole(["Owner", "Admin", "SEO"]) && hasPermission("Product Admin") && (
                <DropdownMenuItem asChild>
                  <Link href={`/admin/add-update-product/${row.seller_id}/${row._id}`} target="_blank" className="flex items-center gap-2 cursor-pointer">
                    <Edit className="h-4 w-4" /> Edit
                  </Link>
                </DropdownMenuItem>
              )}

              {hasAnyRole(["Owner", "Admin", "SEO"]) && hasPermission("Page") && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/faqs/Product/${row._id}`} target="_blank" className="flex items-center gap-2 cursor-pointer">
                      <Edit className="h-4 w-4" /> FAQs
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/testimonials/Product/${row._id}`} target="_blank" className="flex items-center gap-2 cursor-pointer">
                      <Edit className="h-4 w-4" /> Testimonial
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm font-medium text-muted-foreground">{row.dietary_type}</p>
          
          <div className="mt-3 space-y-2">
            {["Category", "Tag", "Type"].map((module) => (
              <MetaRow key={module} label={module} items={row.metas?.filter((m) => m.module === module)} basePath="/product-meta" />
            ))}
            <MetaRow label="Ingredients" items={row.ingridients} clickable={false} />
            <MetaRow label="Brands" items={row.brands} basePath="/product-brand" />
          </div>

          <div className="space-y-3">
            {/* SKUs Section */}
            {row.skus?.map((i) => (
              <div 
                key={i._id.toString()} 
                className="p-4 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors space-y-3"
              >
                <p className="font-semibold text-base">{i.name}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div className="space-y-1">
                    <p><strong className="text-foreground">Price:</strong> ₹{i.price}</p>
                    <p><strong className="text-foreground">Inventory:</strong> {i.inventory}</p>
                    <p><strong className="text-foreground">Weight:</strong> {i.details?.weight || 0} units</p>
                  </div>
                  <div className="space-y-1">
                    <p><strong className="text-foreground">Dimensions:</strong> {i.details?.length || 0}L × {i.details?.width || 0}W × {i.details?.height || 0}H</p>
                    <p><strong className="text-foreground">Prep Time:</strong> {i.details?.preparationTime || 0} mins</p>
                    <p><strong className="text-foreground">Display Order:</strong> {i.displayOrder || 0}</p>
                  </div>
                </div>
                <MetaRow label="Flavors" items={i.flavors} basePath="/flavor" />
                <MetaRow label="Colors" items={i.colors} basePath="/color" />
                {!i.status && (
                  <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-destructive/10 text-destructive rounded">
                    Inactive
                  </span>
                )}
              </div>
            ))}
          </div>

          <MediaCards items={row.medias} height={50} width={60} />
          
          <div className="mt-3">
            <StatusSwitch id={row._id.toString()} status={row.status} modelName="Product" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
