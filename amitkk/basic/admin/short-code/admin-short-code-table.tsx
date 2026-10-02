import { TableCell, TableRow } from '@amitkk/components/basic/table';
import ModuleLink from '@amitkk/basic/static/ModuleLink';
import { ShortCodeProps } from '@amitkk/basic/types';
import { ActionCell } from "@amitkk/components/basic/ActionCell";

export interface DataProps extends ShortCodeProps {
};

type Props = {
  row: DataProps;
  onEdit: (row: DataProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <TableRow>
      <TableCell>{row.call_id}</TableCell>
      <TableCell>{row.module}</TableCell>
      <TableCell>
        {row.details?.map((d) => (
          <ModuleLink key={d._id} module={row.module} module_name={d.module_data?.name} module_url={d.module_data?.url}/>
        ))}
      </TableCell>
      <ActionCell row={row} modelName="ShortCide" onEdit={onEdit}/>
    </TableRow>
  );
}