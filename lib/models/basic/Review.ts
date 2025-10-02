import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface ReviewProps extends Document<Types.ObjectId> {
  module: string;
  module_id: Types.ObjectId;
  user_id: Types.ObjectId;
  review: string;
  rating: number;
  status: boolean;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
  mediaHub?: Types.ObjectId[];
}

const reviewSchema = new Schema<ReviewProps>({
    module: { type: String, required: true, enum: ["Blog", "Destination", "Product", "Page"] },
    module_id: { type: Schema.Types.ObjectId, required: true, refPath: "module" },
    user_id: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    review: { type: String, required: true },
    rating: { type: Number, required: true },
    status: { type: Boolean, required: true },
    displayOrder: { type: Number, required: false, },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

reviewSchema.virtual("mediaHub", { ref: "MediaHub", localField: "_id", foreignField: "module_id", justOne: false, match: { module: "Review" }, });
export default models.Review || model<ReviewProps>("Review", reviewSchema);