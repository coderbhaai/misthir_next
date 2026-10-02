"use client";

import * as React from "react";
import { Edit, Check, Plus } from "lucide-react";
import { fullAddress } from "../utils/addressUtils";
import { Button } from "@amitkk/components/ui/button";

type AddressSelectionDropdownProps = {
  addressOptions: any[];
  selectedAddressId?: string;
  onSelect: (addressId: string) => void;
  onEdit?: (addressId: string) => void;
  onAddAddress?: () => void;
  label?: string;
  addButtonLabel?: string;
};

export default function AddressSelectionDropdown({ addressOptions = [], selectedAddressId = "", onSelect, onEdit, onAddAddress, label = "Select Address", addButtonLabel = "Create Address" }: AddressSelectionDropdownProps) {
  const isValid = addressOptions.some((a) => a._id === selectedAddressId);
  const safeValue = isValid ? selectedAddressId : "";

  return (
    <div className="w-full my-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-foreground">{label}</label>

        {onAddAddress && (
          <Button type="button" variant="outline" size="sm" onClick={onAddAddress} className="flex items-center gap-1.5 text-xs h-8">
            <Plus className="h-3.5 w-3.5" />
            <span>{addButtonLabel}</span>
          </Button>
        )}
      </div>
      {addressOptions.length === 0 ? (
        <div className="p-4 text-center text-sm text-muted-foreground border border-dashed rounded-lg">No addresses available</div>
      ) : (
        <div className="grid gap-3">
          {addressOptions.map((item: any) => {
            const isSelected = item._id === safeValue;

            return (
              <div key={item._id} onClick={() => onSelect(item._id)} className={`relative flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                  isSelected ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary" : "border-border bg-card hover:border-muted-foreground/50 hover:bg-accent/50"}`}>
                <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all ${ isSelected ? "border-primary bg-primary text-primary-foreground" : "border-gray-400 dark:border-gray-500 bg-background hover:border-primary"}`}>
                  {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                </div>

                <div className="flex-1 pr-8">
                  <p className="text-sm text-muted-foreground leading-relaxed">{fullAddress(item)}</p>
                </div>

                {onEdit && (
                  <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-foreground" 
                    onClick={(e) => { e.stopPropagation(); onEdit(item._id); }} aria-label="Edit address">
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}