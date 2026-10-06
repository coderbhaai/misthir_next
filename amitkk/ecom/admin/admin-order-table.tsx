import { OrderProps } from '@amitkk/ecom/types';
import { OrderTableRow } from '@amitkk/ecom/static/OrderTableRow';
import { OrderCardView } from '@amitkk/ecom/static/OrderCardView';

type Props = {
  row: OrderProps;
  viewMode?: "table" | "grid";
};

export function AdminDataTable({ row, viewMode = "table" }: Props) {
  if (viewMode === "grid") {
    return <OrderCardView row={row}/>;
  }

  return <OrderTableRow row={row}/>;
}