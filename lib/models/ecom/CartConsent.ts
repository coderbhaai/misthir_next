import mongoose, { Schema, model, models, Types, Document } from "mongoose";

export interface CartConsentDoc extends Document<Types.ObjectId> {
  cart_id?: string | Types.ObjectId;
  user_id?: string | Types.ObjectId;
  city_id?: string | Types.ObjectId;
  state_id?: string | Types.ObjectId;
  country_id?: string | Types.ObjectId;
  email?: string;
  phone?: string;
  emailConsent?: boolean;
  phoneConsent?: boolean;
  user_remarks?: string;
  admin_remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CartConsentSchema = new Schema<CartConsentDoc>({
    cart_id: { type: Schema.Types.ObjectId, ref: 'Cart' },
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    city_id: { type: Schema.Types.ObjectId, ref: 'City',  },
    state_id: { type: Schema.Types.ObjectId, ref: 'State', },
    country_id: { type: Schema.Types.ObjectId, ref: 'Country', },
    email: { type: String },
    phone: { type: String },
    emailConsent: { type: Boolean },
    phoneConsent: { type: Boolean },
    user_remarks: { type: String },
    admin_remarks: { type: String },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.models.CartConsent || mongoose.model<CartConsentDoc>("CartConsent", CartConsentSchema);