import mongoose, { Schema, Document, Types, model } from 'mongoose';

interface ProductmetaReference {
  productmeta_id: {
    _id: Types.ObjectId;
    name: string;
    url: string;
  };
}

interface ProductDocument extends Document {
  name: string;
  url: string;
  vendor_id?: Types.ObjectId;
  meta_id?: Types.ObjectId;
  gtin: string;
  dietary_type : string;
  short_desc?: string;
  long_desc?: string;
  adminApproval: boolean;
  status: boolean;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
  metas?: ProductmetaReference[];
  productmetas?: { _id: Types.ObjectId; name: string; url: string }[]; 
}

const productSchema = new Schema<ProductDocument>({
  name: { type: String, required: true },
  url: { type: String, required: true, unique: true },
  status: { type: Boolean, default: true },
  adminApproval: { type: Boolean, default: true },
  dietary_type : { type: String, required: true },
  displayOrder: { type: Number, required: false, },
  vendor_id: { type: Schema.Types.ObjectId, ref: 'Vendor' },
  meta_id: { type: Schema.Types.ObjectId, ref: 'Meta' },
  short_desc: { type: String, required: false },
  long_desc: { type: String, required: false },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

productSchema.virtual('products', { ref: 'ProductProductmeta', localField: '_id', foreignField: 'product_id', justOne: false });

productSchema.virtual('productmetas').get(function (this: ProductDocument) {
  if (!this.metas || !Array.isArray(this.metas)) return [];
  return this.metas
   ?.map((meta) => {
      if (!meta.productmeta_id) return null;
      const { _id, name, url } = meta.productmeta_id;
      return { _id, name, url };
    })
    .filter(Boolean);
});

export default mongoose.models.Product || model<ProductDocument>('Product', productSchema);