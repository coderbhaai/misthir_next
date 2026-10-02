import { TableCell, TableRow } from '@amitkk/components/basic/table';
import { ActionCell } from '@amitkk/components/basic/ActionCell';
import { SiteSettingProps } from "@amitkk/payment/types";

type Props = {
  row: SiteSettingProps;
  onEdit: (row: SiteSettingProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <>
      <TableRow>
        <TableCell>{row.module}</TableCell>
        <TableCell>{row.module_value}</TableCell>
        <ActionCell row={row} modelName="SiteSetting" onEdit={onEdit}/>
      </TableRow>
    </>
  );
}
