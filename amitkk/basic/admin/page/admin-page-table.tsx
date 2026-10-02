import { TableCell, TableRow } from '@amitkk/components/basic/table';
import MetaTableInput from '@amitkk/components/admin/meta-table-input';
import MediaImage from '@amitkk/components/admin/table-image';
import Link from 'next/link';
import { ActionCell } from "@amitkk/components/basic/ActionCell";
import type { MediaProps } from '@amitkk/basic/types/media';
import type { MetaTableProps } from "@amitkk/seo/types";
import AdminRowActions from '@amitkk/components/admin/AdminRowActions';

export type DataProps = {
  _id: string;
  module: string;
  module_id: string;
  name: string;
  url: string;
  status: boolean;
  schema_status: boolean;
  sitemap: boolean;
  media_id: string | MediaProps;
  meta_id: MetaTableProps;
  createdAt: Date;
  updatedAt: Date;
};

type Props = {
  row: DataProps;
};

export function AdminDataTable({ row }: Props) {
  return (
    <>
      <TableRow>
        <TableCell>{row.module}</TableCell>
        <TableCell><Link href={`/${row.url}`} target="_blank">{row.name}<br/>{row.url}</Link></TableCell>
        <TableCell><MediaImage media={row.media_id as MediaProps}/></TableCell>
        <TableCell>
          Status - { row.status ? 'Yes' : 'no' }<br/>
          Schema - { row.schema_status ? 'Yes' : 'No' }<br/>
          Sitemap - { row.sitemap ? 'Yes' : 'no' }
        </TableCell>
        <TableCell><MetaTableInput meta={row.meta_id} /></TableCell>
        <ActionCell row={row} modelName="Page" usePopover/>
      </TableRow>

      <AdminRowActions id={row._id.toString()} actions={[
        { label: "Edit", href: `/admin/add-update-page/${row._id}` },
        { label: "Preview", href: `/admin-preview/page/${row.url}` },
        { label: "FAQ", href: `/admin/faqs/${row.module}/${row.module_id}` },
        { label: "Testimonial", href: `/admin/testimonials/${row.module}/${row.module_id}` },
      ]}/>
    </>
  );
}
