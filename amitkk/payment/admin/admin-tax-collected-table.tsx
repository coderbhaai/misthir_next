import { useRouter } from 'next/router';
import { TableCell, TableRow } from '@amitkk/components/basic/table';
import { TaxCollectedProps } from '@amitkk/payment/types';

export interface DataProps extends TaxCollectedProps {
}

type Props = {
  row: DataProps;
};

export function AdminDataTable({ row }: Props) {
  const router = useRouter();

  const getModuleUrl = (moduleName: string, id: string | number) => {
    switch (moduleName?.toLowerCase()) {
      case 'order':
        return `/order/${id}`;
      default:
        return `/${moduleName?.toLowerCase()}/${id}`;
    }
  };

  const handleRedirect = () => {
    if (!row.module || !row.module_id) return;
    const targetUrl = getModuleUrl(row.module, row.module_id);
    router.push(targetUrl);
  };

  return (
    <TableRow>
      <TableCell>{row.module}</TableCell>
      <TableCell>{row.cgst || 0}</TableCell>
      <TableCell>{row.sgst || 0}</TableCell>
      <TableCell>{row.igst || 0}</TableCell>
      <TableCell>{row.total || 0}</TableCell>
      <TableCell>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
      <TableCell>{row.module_id && ( <button onClick={handleRedirect} className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition">View {row.module}</button>)}</TableCell>
    </TableRow>
  );
}