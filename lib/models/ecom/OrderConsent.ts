import mongoose, { Schema, model, models, Types, Document } from "mongoose";

export interface OrderConsentDoc extends Document<Types.ObjectId> {
  user_id?: string | Types.ObjectId;
  email?: string;
  phone?: string;
  city_id?: string | Types.ObjectId;
  state_id?: string | Types.ObjectId;
  country_id?: string | Types.ObjectId;
  emailConsent?: boolean;
  phoneConsent?: boolean;
  email_duplicate?: boolean;
  phone_duplicate?: boolean;
  user_remarks?: string;
  admin_remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderConsentSchema = new Schema<OrderConsentDoc>({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    email: { type: String },
    phone: { type: String },
    city_id: { type: Schema.Types.ObjectId, ref: 'City',  },
    state_id: { type: Schema.Types.ObjectId, ref: 'State', },
    country_id: { type: Schema.Types.ObjectId, ref: 'Country', },
    emailConsent: { type: Boolean },
    phoneConsent: { type: Boolean },
    email_duplicate: { type: Boolean },
    phone_duplicate: { type: Boolean },
    user_remarks: { type: String },
    admin_remarks: { type: String },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.models.OrderConsent || mongoose.model<OrderConsentDoc>("OrderConsent", OrderConsentSchema);