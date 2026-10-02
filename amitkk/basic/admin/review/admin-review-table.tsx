import { TableCell, TableRow } from '@amitkk/components/basic/table';
import { ReviewProps } from '@amitkk/basic/types';
import { ActionCell } from "@amitkk/components/basic/ActionCell";
import { GenericModule } from '@amitkk/basic/types/generic';

export interface DataProps extends ReviewProps {
};

type Props = {
  row: DataProps;
  onEdit: (row: DataProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <TableRow>
      <TableCell>
        {row.module}<br/>
        {row.module === "Blog" && ( <a href={`/${(row.module_id as GenericModule).url}`} target="_blank">{(row.module_id as GenericModule).name}</a> )}
      </TableCell>
      <TableCell>{row.module}</TableCell>
      <TableCell>{row.rating} Star<br/>{row.review}</TableCell>
      <ActionCell row={row} modelName="Review" onEdit={onEdit}/>
    </TableRow>
  );
}
