import { TableCell, TableRow } from "@amitkk/components/basic/table";
import Link from "next/link";
import { Iconify } from "@amitkk/basic/utils/my-utils/admin-utils";
import { OrderGuideProps } from "@amitkk/wishlist/types";
import { formatTimeAgo } from "@amitkk/basic/utils/my-utils/date-utils";

export interface DataProps extends OrderGuideProps {}

type UserTableRowProps = {
  row: DataProps;
  onEdit?: (row: DataProps) => void;
  onMakeDefault?: (row: DataProps) => void;
  onDuplicate?: (row: DataProps) => void;
  onHide?: (row: DataProps) => void;
  onDelete?: (row: DataProps) => void;
};

export function AdminDataTable({ row, onEdit }: UserTableRowProps) {
  const itemCount = row.products?.length ?? 0;
  const updatedAgo = formatTimeAgo(row.updatedAt);

  return (
    <TableRow>
      <TableCell>{row.name}</TableCell>
      <TableCell>{itemCount} {itemCount === 1 ? "Item" : "Items"}</TableCell>
      <TableCell>{updatedAgo}</TableCell>
      <TableCell align='right'><Link href={`/admin/order-guide/${row?._id}`}><Iconify icon='Edit'/></Link></TableCell>
    </TableRow>
  );
}