import { TableCell, TableRow } from '@amitkk/components/basic/table';
import { fullAddress } from '@amitkk/address/utils/addressUtils';
import { AddressProps } from '@amitkk/address/types';

export interface DataProps extends AddressProps {
};

type Props = {
  row: DataProps;
  onEdit: (row: DataProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {  
  return (
    <>
      <TableRow>
       <TableCell>{fullAddress(row)}</TableCell>
      </TableRow>
    </>
  );
}
