import { AddressProps } from '@amitkk/address/types';
import { AddressCardView } from './AddressCardView';
import { AddressTableRow } from './AddressTableRow';

type Props = {
  row: AddressProps;
  onEdit: (row: AddressProps) => void;
  viewMode?: "table" | "grid";
};

export function AdminDataTable({ row, onEdit, viewMode = "table" }: Props) {
  if (viewMode === "grid") {
    return <AddressCardView row={row} onEdit={onEdit} />;
  }

  return <AddressTableRow row={row} onEdit={onEdit} />;
}