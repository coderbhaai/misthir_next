import { ActionCell } from '@amitkk/components/basic/ActionCell';
import { TableCell, TableRow } from '@amitkk/components/basic/table';
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface SeoMetaProps {
  title?: string;
  description?: string;
  robots?: string;
  canonical?: string;
  ogType?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

export interface DataProps {
  _id: string;
  name: string;
  url: string;
  module: string;
  module_id: string;
  seo?: SeoMetaProps;
  schema?: Record<string, any>;
  createdAt: Date | string;
  updatedAt: Date | string;
}

type Props = {
  row: DataProps;
  onEdit: (row: DataProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  const cellScrollClass = "max-h-[120px] max-w-[300px] overflow-y-auto overflow-x-hidden whitespace-pre-wrap block font-mono text-xs";

  const [copiedSeo, setCopiedSeo] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  const handleCopy = (text: string, type: 'seo' | 'schema') => {
    navigator.clipboard.writeText(text);
    if (type === 'seo') {
      setCopiedSeo(true);
      setTimeout(() => setCopiedSeo(false), 2000);
    } else {
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 2000);
    }
  };

  return (
  <TableRow>
    <TableCell className="font-medium align-top">
      {row._id}<br/>
      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">{row.module}</span>         
      <div className="mt-1">
        <span className="font-semibold">{row.name}</span><br/>
        <span className="text-muted-foreground text-xs">{row.url}</span>
      </div>
    </TableCell>
    
    <TableCell className="align-top">
      <div className="relative group">
        {row.seo && Object.keys(row.seo).length > 0 && (
          <button onClick={() => handleCopy(JSON.stringify(row.seo, null, 2), 'seo')} className="absolute top-2 right-5 p-2 bg-background/80 hover:bg-muted rounded border border-border text-foreground transition-all duration-200 z-10 shadow-sm" title="Copy SEO JSON">
            {copiedSeo ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        )}
        <div>
          {row.seo && Object.keys(row.seo).length > 0 ? (
            <pre className="p-3 bg-muted/50 rounded pr-10 text-xs whitespace-pre-wrap break-all font-mono max-h-30 overflow-y-auto">
              {JSON.stringify(row.seo, null, 2)}
            </pre>
          ) : (
            <span className="text-muted-foreground italic">No SEO Data</span>
          )}
        </div>
      </div>
    </TableCell>

    <TableCell className="align-top">
      <div className="relative group">
        {row.schema && Object.keys(row.schema).length > 0 && (
          <button onClick={() => handleCopy(JSON.stringify(row.schema, null, 2), 'schema')} className="absolute top-2 right-5 p-2 bg-background/80 hover:bg-muted rounded border border-border text-foreground transition-all duration-200 z-10 shadow-sm" title="Copy Schema JSON">
            {copiedSchema ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        )}
        <div>
          {row.schema ? (
            <pre className="p-3 bg-muted/50 rounded pr-10 text-xs whitespace-pre-wrap break-all font-mono max-h-30 overflow-y-auto">
              {JSON.stringify(row.schema, null, 2)}
            </pre>
          ) : (
            <span className="text-muted-foreground italic">No Schema Data</span>
          )}
        </div>
      </div>
    </TableCell>

    <TableCell className="align-top">
      <ActionCell row={row} modelName="UrlRegistry" onEdit={onEdit}/>
    </TableCell>
  </TableRow>
);
}