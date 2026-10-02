"use client";

import { FaqProps } from "@amitkk/basic/types";
import ModuleLink from "@amitkk/basic/static/ModuleLink";
import { TableCell, TableRow } from "@amitkk/components/basic/table";
import { ActionCell } from "@amitkk/components/basic/ActionCell";

export interface DataProps extends FaqProps {
  module: string;
  module_id: | string;
}

type Props = {
  row: DataProps;
  onEdit: () => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <TableRow>
      <TableCell>{row.module}</TableCell>
      <TableCell><ModuleLink module={ row.module } module_url={( row.module_id as any )?.url } module_name={( row.module_id as any )?.name }/></TableCell>
      <TableCell>{row.question}</TableCell>
      <ActionCell row={row} modelName="Faq" onEdit={onEdit}/>
    </TableRow>
  );
}