import { TableCell, TableRow } from '@amitkk/components/basic/table';
import { OrderProps } from '@amitkk/ecom/types';
import CartSkuDetails from '@amitkk/ecom/admin/CartSkuDetails';
import CartChargesDetails from '@amitkk/ecom/admin/CartChargesDetails';
import { ActionCell } from '@amitkk/components/basic/ActionCell';

export interface DataProps extends OrderProps{
}

type Props = {
  row: DataProps;
  onEdit: (row: DataProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <>
      <TableRow>
        <TableCell><CartSkuDetails skus={row.orderSkus}/></TableCell>
        <TableCell>
          Total : {row.total}<br/>
          Paid : {row.paid}
        </TableCell>
        <TableCell><CartChargesDetails charges={row.orderCharges}/></TableCell>
        <ActionCell row={row} modelName="Blogmeta" onEdit={onEdit}/>
      </TableRow>
    </>
  );
}
