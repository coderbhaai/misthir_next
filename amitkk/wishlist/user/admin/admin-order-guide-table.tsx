import { OrderGuideProps } from "@amitkk/wishlist/types";
import { UserOrderGuideTableRow } from "@amitkk/wishlist/user/admin/UserOrderGuideTableRow";
import { UserOrderGuideCardView } from "@amitkk/wishlist/user/admin/UserOrderGuideCardView";

type Props = {
  row: OrderGuideProps;
  viewMode?: "table" | "grid";
  onEdit: (row: OrderGuideProps) => void;
};

export function AdminDataTable({ row, onEdit, viewMode = "grid" }: Props) {
  if (viewMode === "grid") {
    return <UserOrderGuideCardView row={row}/>;
  }

  return <UserOrderGuideTableRow row={row}/>;
}