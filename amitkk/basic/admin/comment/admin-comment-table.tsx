import { TableCell, TableRow } from '@amitkk/components/basic/table';
import ModuleLink from '@amitkk/basic/static/ModuleLink';
import { ActionCell } from "@amitkk/components/basic/ActionCell";
import { SingleCommentProps } from "@amitkk/basic/types/shared";

type Props = {
  row: SingleCommentProps;
  onEdit: (row: SingleCommentProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <TableRow>
      <TableCell>{row.module}</TableCell>
      <TableCell><ModuleLink module={row.module} module_url={(row.module_id as any).url} module_name={(row.module_id as any).name}/></TableCell>
      <TableCell>{row.name}<br/>{row.email}</TableCell>
      <TableCell>{row.content}</TableCell>
      <ActionCell row={row} modelName="CommentModel" onEdit={onEdit}/>
    </TableRow>
  );
}
