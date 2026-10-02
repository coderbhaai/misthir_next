import { MetaTempProps } from '@amitkk/basic/types/excel';
import { TableCell, TableRow } from '@amitkk/components/basic/table';

type Props = {
  row: MetaTempProps;
};

export function AdminDataTable({ row }: Props) {
  return (
    <>
      <TableRow>
        <TableCell>{row.url}</TableCell>
        <TableCell style={{ width: "400px" }}><div style={{ wordBreak: "break-word", overflowWrap: "break-word", whiteSpace: "normal", lineHeight: "1.5" }}>{row.title}</div></TableCell>
        <TableCell style={{ width: "400px" }}><div style={{ wordBreak: "break-word", overflowWrap: "break-word", whiteSpace: "normal", lineHeight: "1.5" }}>{row.description}</div></TableCell>
        <TableCell>{row.focus_keyword}</TableCell>
        <TableCell>
          <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, color: "#fff", backgroundColor: row.status === "Success" ? "#4CAF50" : row.status === "Failed" ? "#F44336" : "#9E9E9E", textTransform: "uppercase" }}>{row.status}</span>
        </TableCell>
        <TableCell style={{ whiteSpace: "pre-line" }}>{row.message?.replace(/<br\/?>/g, "\n</TableCell>
        <TableCell>{new Date(row.createdAt ?? new Date()).toLocaleDateString()}</TableCell>
      </TableRow>
    </>
  );
}
