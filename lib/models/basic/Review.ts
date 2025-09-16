import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ReviewProps extends Document {
  module: string;
  module_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  review: string;
  rating: number;
  status: boolean;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<ReviewProps>({
    module: { type: String, required: true },
    module_id: { type: Schema.Types.ObjectId, required: true },
    user_id: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    review: { type: String, required: true },
    rating: { type: Number, required: true },
    status: { type: Boolean, required: true },
    displayOrder: { type: Number, required: false, },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.models.Review || mongoose.model<ReviewProps>('Review', reviewSchema);