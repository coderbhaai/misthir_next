import mongoose, { Schema, Document, Types, model } from 'mongoose';

export interface SellerServiceAreaDocument extends Document<Types.ObjectId> {
    seller_id: Types.ObjectId;
    module: string;
    module_id: string | Types.ObjectId;
    status: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const sellerServiceAreaSchema = new Schema<SellerServiceAreaDocument>({
    seller_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    module: { type: String, required: true },
    module_id: { type: Schema.Types.ObjectId, required: true, refPath: "module" },
    status: { type: Boolean, default: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

sellerServiceAreaSchema.index({ seller_id: 1, country_id: 1 });

export default mongoose.models.SellerServiceArea || model<SellerServiceAreaDocument>('SellerServiceArea', sellerServiceAreaSchema);