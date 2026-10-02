import { TableCell, TableRow } from '@amitkk/components/basic/table';
import ModuleLink from '@amitkk/basic/static/ModuleLink';
import { SingleTestimonialProps } from '@amitkk/basic/types';
import { ActionCell } from "@amitkk/components/basic/ActionCell";
import { getProp } from '@amitkk/basic/utils/my-utils/shared-utils';

export interface ModuleReference {
  _id: string;
  name: string;
  url: string;
}

type Props = {
  row: SingleTestimonialProps;
  onEdit: (row: SingleTestimonialProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <TableRow>
      <TableCell>
        {row.module}<br/>
        <ModuleLink module={row.module} module_url={(row.module_id as any)?.url} module_name={(row.module_id as any)?.name}/>
      </TableCell>
      <TableCell>{getProp(row.client_id, "name")}</TableCell>
      <TableCell className="whitespace-normal break-words">
        {row.content ? new DOMParser().parseFromString(row.content, "text/html").body?.textContent || "" : ""}
      </TableCell>
      <ActionCell row={row} modelName="Testimonial" onEdit={onEdit}/>
    </TableRow>
  );
}
