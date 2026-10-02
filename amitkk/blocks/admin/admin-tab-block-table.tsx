import { TableCell, TableRow } from '@amitkk/components/basic/table';
import { Iconify } from "@amitkk/basic/utils/my-utils/admin-utils";
import Link from 'next/link';
import ModuleLink from '@amitkk/basic/static/ModuleLink';
import { TabBlockGroup } from '../types';

type Props = {
  row: TabBlockGroup;
};

export function AdminDataTable({ row }: Props) {
  return (
    <>
      <TableRow>
        <TableCell>{row.module}</TableCell>
        <TableCell><ModuleLink module={row.module} module_url={(row.module_id).url} module_name={(row.module_id).name}/></TableCell>
        <TableCell>{row.blocks.map((block) => block.menu).join(", ")}</TableCell>
        <TableCell align='right'><Link href={`/admin/add-update-tab-block/${row.module}/${row.module_id?._id}`}><Iconify icon='Edit' />Edit</Link></TableCell>
      </TableRow>
    </>
  );
}
