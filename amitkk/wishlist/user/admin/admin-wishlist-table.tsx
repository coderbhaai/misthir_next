import { WishlistProps } from '@amitkk/wishlist/types';
import { UserWishlistTableRow } from '@amitkk/wishlist/static/UserWishlistTableRow';
import { UserWishlistCardView } from '@amitkk/wishlist/static/UserWishlistCardView';

export interface DataProps extends WishlistProps {}

type Props = {
  row: DataProps;
  viewMode?: "table" | "grid";
};

export function AdminDataTable({ row, viewMode = "table" }: Props) {
  if (viewMode === "grid") {
    return <UserWishlistCardView row={row} />;
  }

  return <UserWishlistTableRow row={row} />;
}