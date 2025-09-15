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