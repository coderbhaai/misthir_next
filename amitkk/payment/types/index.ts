export type TaxProps = {
  _id: string;
  name: string;
  rate: string;
  status: boolean;
  displayOrder: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export type TaxCollectedProps = {
  _id: string;
  module: string;
  module_id: string;
  cgst?: DecimalValue;
  sgst?: DecimalValue;
  igst?: DecimalValue;
  total?: DecimalValue;
  createdAt: Date;
  updatedAt: Date;
}
export type SiteSettingProps = {
  _id: string;
  module: string;
  module_value: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}