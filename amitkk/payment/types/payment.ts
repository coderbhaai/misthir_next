import { Types } from "mongoose";

export type TaxProps = {
  _id: string | Types.ObjectId;
  name: string;
  rate: string;
  status: boolean;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type TaxCollectedProps = {
  _id: string | Types.ObjectId;
  module: string;
  module_id: string | Types.ObjectId;
  cgst?: DecimalValue;
  sgst?: DecimalValue;
  igst?: DecimalValue;
  total?: DecimalValue;
  createdAt: Date;
  updatedAt: Date;
}