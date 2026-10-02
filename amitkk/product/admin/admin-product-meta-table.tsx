import { TableCell, TableRow } from '@amitkk/components/basic/table';
import Link from 'next/link';
import { ProductMetaProps } from '../types';
import { MediaProps } from '@amitkk/basic/types/media';
import MetaTableInput from '@amitkk/components/admin/meta-table-input';
import StatusSwitch from '@amitkk/components/admin/status-switch';
import { EditCell } from '@amitkk/components/basic/EditCell';
import MediaImage from '@amitkk/components/admin/table-image';
import { CellLink } from '@amitkk/components/basic/CellLink';
import { getProp } from '@amitkk/basic/utils/my-utils/shared-utils';

export interface DataProps extends ProductMetaProps {
  title: string;
  description: string;
};

type Props = {
  row: DataProps;
  onEdit: (row: DataProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <TableRow>
      <TableCell>{row.module}</TableCell>
      <TableCell><CellLink title={row.name} url={row.url} prefix="/products/meta"/></TableCell>
      <TableCell>
        {(() => {
          const parent = row.parent_id;
          if (parent && typeof parent === "object") {
            const parentName = getProp(parent, "name", "-");
            const parentUrl = getProp(parent, "url", "#");

            return (
              <Link href={`/products/type/${parentUrl}`} target="_blank" className="text-blue-600 hover:underline">{parentName}</Link>
            );
          }
          return parent ? String(parent).slice(0, 8) + "..." : "-";
        })()}
      </TableCell>
      <TableCell><MediaImage media={row.media_id as MediaProps}/></TableCell>
      <TableCell><MetaTableInput meta={row.meta_id} /></TableCell>
      <TableCell><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.highlight ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800" }`}>{row.highlight ? "Active" : "Inactive"}</span></TableCell>
      <TableCell><StatusSwitch id={row._id.toString()} status={row.status} modelName="Productmeta"/></TableCell>
      <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
      <EditCell onClick={() => onEdit(row)} />
    </TableRow>
  );
}
