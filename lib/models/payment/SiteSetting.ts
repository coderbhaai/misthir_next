import { Schema, model, models, Document } from "mongoose";

interface SiteSettingDoc extends Document {
  module: string;
  module_value: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const siteSettingSchema = new Schema<SiteSettingDoc>({
  module: { type: String, required: true },
  module_value: { type: String, required: true },
  status: { type: Boolean, required: true, default: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

export default models.SiteSetting || model<SiteSettingDoc>("SiteSetting", siteSettingSchema);