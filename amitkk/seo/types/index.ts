// amitkk > seo > types > index.ts


export interface MetaTableProps {
  meta_id?: string;
  title?: String;
  description?: String;
}

export interface SingleMetaProps {
  _id: string;
  url: string;
  title: string;
  description: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}