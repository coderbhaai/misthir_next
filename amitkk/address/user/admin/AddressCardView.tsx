import { fullAddress } from '@amitkk/address/utils/addressUtils';
import { MapPin, Phone, Edit2 } from "lucide-react";
import { AddressProps } from '@amitkk/address/types';
import { ActionCell } from '@amitkk/components/basic/ActionCell';

type Props = {
  row: AddressProps;
  onEdit: (row: AddressProps) => void;
};

export function AddressCardView({ row, onEdit }: Props) {
  return (
    <div className="col-span-12 md:col-span-4 card p-3">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-xl text-gray-700 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-base">{row.name}</h4>
              {row.phone && ( <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" /> {row.phone}</p> )}
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 bg-gray-50/50 rounded-xl p-3.5 border border-gray-100 leading-relaxed">{fullAddress(row)}</p>
      </div>
      <ActionCell row={row} modelName="Address" onEdit={onEdit}/>
    </div>
  );
}