import { OrderGuideProps } from "@amitkk/wishlist/types";
import { OrderGuideTableRow } from "@amitkk/wishlist/admin/OrderGuideTableRow";
import { OrderGuideCardView } from "@amitkk/wishlist/admin/OrderGuideCardView";

type Props = {
  row: OrderGuideProps;
  viewMode?: "table" | "grid";
};

export function AdminDataTable({ row, viewMode = "table" }: Props) {
  if (viewMode === "grid") {
    return <OrderGuideCardView row={row}/>;
  }

  return <OrderGuideTableRow row={row}/>;
}