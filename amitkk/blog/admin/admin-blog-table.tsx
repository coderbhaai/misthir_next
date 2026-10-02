import { TableCell, TableRow } from '@amitkk/components/basic/table';
import MetaTableInput from '@amitkk/components/admin/meta-table-input';
import { getProp } from "@amitkk/basic/utils/my-utils/shared-utils";
import MediaImage from '@amitkk/components/admin/table-image';
import Link from 'next/link';
import type { MediaProps } from '@amitkk/basic/types/media';
import AdminRowActions from '@amitkk/components/admin/AdminRowActions';
import { ActionCell } from "@amitkk/components/basic/ActionCell";
import { SingleBlogProps } from '@amitkk/basic/types/shared';
import AdminModulePill from "@amitkk/basic/static/AdminModulePill";

export interface DataProps extends SingleBlogProps {
}

type Props = {
  row: DataProps;
};

export function AdminDataTable({ row }: Props) {
  return (
    <>
      <TableRow>
        <TableCell><Link href={`/${row.url}`} target="_blank">{row.name}<br/>{row.url}</Link></TableCell>
        <TableCell><MediaImage media={row.media_id as MediaProps} url={`/${row.url}`}/></TableCell>
        <TableCell>
          <AdminModulePill label="Category:" items={row.metas?.filter(m => m.blogmeta_id?.type === 'category')} getId={m => m.blogmeta_id?._id} getName={m => m.blogmeta_id?.name} getUrl={m => m.blogmeta_id?.url} getBasePath={() => '/blogs/category'}/>
          <AdminModulePill label="Tags:" items={row.metas?.filter(m => m.blogmeta_id?.type === 'tag')} getId={m => m.blogmeta_id?._id} getName={m => m.blogmeta_id?.name} getUrl={m => m.blogmeta_id?.url} getBasePath={() => '/blogs/tag'}/>
        </TableCell>
        <TableCell>{getProp(row.author_id, "name")}</TableCell>
        <TableCell><MetaTableInput meta={row.meta_id} /></TableCell>
        <ActionCell row={row} modelName="Blog" usePopover/>
      </TableRow>

      <AdminRowActions id={row._id.toString()} actions={[
        { label: "Edit", href: `/admin/add-update-blog/${row._id}` },
        { label: "Preview", href: `/admin-preview/blog/${row.url}` },
        { label: "FAQ", href: `/admin/faqs/Blog/${row._id}` },
        { label: "Testimonial", href: `/admin/testimonials/Blog/${row._id}` },
      ]}/>
    </>
  );
}