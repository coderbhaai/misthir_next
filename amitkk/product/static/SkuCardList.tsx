import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@amitkk/components/button/button";
import StatusSwitch from "@amitkk/components/admin/status-switch";
import { getProp } from "@amitkk/basic/utils/my-utils/shared-utils";
import { extractFeatureValues } from "@amitkk/basic/utils/my-utils/ecom-utils";

interface SkuCardListProps {
  skus: any[];
  onEdit?: (index: number) => void;
  onDelete?: (index: number) => void;
  showActions?: boolean;
}

export default function SkuCardList({
  skus = [],
  onEdit,
  onDelete,
  showActions = false,
}: SkuCardListProps) {
  return (
    <div className="space-y-3">
      {skus?.map((sku, index) => {
        const flavorNames = extractFeatureValues( sku?.flavors?.length ? sku.flavors : sku?.features, "Flavor", "name" ).join(", ");
        const colorNames = extractFeatureValues( sku?.colors?.length ? sku.colors : sku?.features, "Color", "name" ).join(", ");

        console.log("sku.details", sku.details)
        return (
          <div key={sku._id?.toString() || index} className="p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors my-3">
            <div className="flex justify-between items-start gap-4 mb-3">
              <div className="flex-grow space-y-3">
                <h4 className="text-base font-semibold text-foreground">{sku.name}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-foreground">
                  <div className="space-y-1">
                    {sku.price && ( <p><strong>Price:</strong> ₹{sku.price}</p> )}
                    {sku.inventory && ( <p><strong>Inventory:</strong> {sku.inventory}</p> )}
                    {sku.weight && ( <p><strong>Weight:</strong> {sku.weight} units</p> )}
                  </div>

                  <div className="space-y-1">
                    {sku.preparationTime && ( <p><strong>Prep Time:</strong> {sku.preparationTime} mins</p> )}
                    {sku.displayOrder && ( <p><strong>Display Order:</strong> {sku.displayOrder}</p> )}
                    {sku.adminApproval !== undefined && ( <p><strong>Admin Approval:</strong>{" "}{sku.adminApproval ? "Yes" : "No"} </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    {sku.item_code && ( <p><strong>Code:</strong> {sku.item_code}</p> )}
                    {sku.unit && ( <p><strong>Unit:</strong> {sku.unit}</p> )}
                    {sku.price_per_unit && ( <p><strong>Price Per Unit:</strong> {sku.price_per_unit}</p> )}
                    {(sku?.details?.length || sku?.details?.width || sku?.details?.height) && ( <p><strong>Dimensions:</strong> {sku?.details?.length || 0}L ×{" "} {sku?.details?.width || 0}W × {sku?.details?.height || 0}H </p> )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {sku.gluttenfree_id && ( 
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {getProp(sku.gluttenfree_id, 'name')}</span>
                  )}
                  {sku.sugarfree_id && ( <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    {getProp(sku.sugarfree_id, 'name')}</span> )}
                  {sku.eggless_id && ( <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    {getProp(sku.eggless_id, 'name')}</span> )}
                  {flavorNames && ( <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">Flavors: {flavorNames}</span> )}
                  {colorNames && ( <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-50 text-pink-700 border border-pink-200">Colors: {colorNames}</span> )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {showActions && (
                  <div className="flex gap-2">
                    {onEdit && ( <Button type="button" variant="outline" size="sm" onClick={() => onEdit(index)}><Edit className="w-4 h-4 mr-1" /> Edit</Button> )}
                    {onDelete && ( <Button type="button" variant="destructive" size="sm" onClick={() => onDelete(index)}><Trash2 className="w-4 h-4 mr-1" /> Delete</Button> )}
                  </div>
                )}
                {sku?._id && !showActions && (
                  <div className="mt-2">
                    <StatusSwitch id={sku._id.toString()} status={sku.status} modelName="Sku"/>
                  </div>
                )}
              </div>
            </div>

            {sku.status === false && ( <span className="inline-block mt-2 px-2 py-0.5 text-xs font-semibold bg-destructive/10 text-destructive rounded">Inactive</span> )}
          </div>
        );
      })}

      {(!skus || skus.length === 0) && ( <div className="my-6 p-6 text-center border border-dashed border-border rounded-lg bg-muted/30 space-y-4"><p>No SKUs added yet.</p></div> )}
    </div>
  );
}