import mongoose, { Schema, Document, Types, model } from 'mongoose';
import { addVirtualRelations } from 'lib/server/plugins/addVirtualRelations';

export interface ProductDocument extends Document<Types.ObjectId> {
    seller_id?: Types.ObjectId;
    meta_id?: Types.ObjectId;
    tax_id?: Types.ObjectId;
    name: string;
    url: string;
    gtin: string;
    dietary_type: string;
    short_desc?: string;
    long_desc?: string;
    status: boolean;
    displayOrder?: number;
    adminApproval: boolean;
    createdAt: Date;
    updatedAt: Date;

    metas?: any[];
    features?: any[];
    ingridients?: any[];
    brands?: any[];
    medias?: any[];
    skus?: any[];
}

const productSchema = new Schema<ProductDocument>({
    tax_id: { type: Schema.Types.ObjectId, ref: 'Tax' },
    seller_id: { type: Schema.Types.ObjectId, ref: 'User' },
    meta_id: { type: Schema.Types.ObjectId, ref: 'Meta' },
    name: { type: String, required: true },
    url: { type: String, required: true, unique: true },
    gtin: { type: String, required: false },
    dietary_type: { type: String, required: true },
    status: { type: Boolean, default: true },
    displayOrder: { type: Number, required: false },
    adminApproval: { type: Boolean, default: true },
    short_desc: { type: String, required: false },
    long_desc: { type: String, required: false },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

addVirtualRelations(productSchema, [
    { populateName: "productMeta", outputName: "metas", ref: "ProductProductmeta", foreignField: "product_id", extractIdField: "productmeta_id", justOne: false, },
    { populateName: "productFeature", outputName: "features", ref: "ProductProductFeature", foreignField: "product_id", extractIdField: "productFeature_id", justOne: false, },
    { populateName: "productIngridient", outputName: "ingridients", ref: "ProductIngridient", foreignField: "product_id", extractIdField: "ingridient_id", justOne: false, },
    { populateName: "productBrand", outputName: "brands", ref: "ProductProductBrand", foreignField: "product_id", extractIdField: "productBrand_id", justOne: false, },
    { populateName: "mediaHubs", outputName: "medias", ref: "MediaHub", foreignField: "module_id", extractIdField: "media_id", match: { module: "Product" }, justOne: false, },
    { populateName: "sku", outputName: "skus", ref: "Sku", foreignField: "product_id", extractIdField: "_id", justOne: false, }
]);

export default mongoose.models.Product || model<ProductDocument>('Product', productSchema);