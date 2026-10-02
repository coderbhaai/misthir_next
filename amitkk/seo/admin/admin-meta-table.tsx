import { TableCell, TableRow } from '@amitkk/components/basic/table';
import { SingleMetaProps } from "../types";
import { EditCell } from '@amitkk/components/basic/EditCell';

type Props = {
  row: SingleMetaProps;
  onEdit: (row: SingleMetaProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <TableRow>
      <TableCell>{row._id}<br/>{row.url}</TableCell>
      <TableCell>{row.title}</TableCell>
      <TableCell style={{ width: "400px" }}><div style={{ wordBreak: "break-word", overflowWrap: "break-word", whiteSpace: "normal", lineHeight: "1.5" }}>{row.description}</div></TableCell>
      <TableCell>{new Date(row.createdAt ?? new Date()).toLocaleDateString()}</TableCell>
      <EditCell onClick={() => onEdit(row)}/>
    </TableRow>
  );
}
