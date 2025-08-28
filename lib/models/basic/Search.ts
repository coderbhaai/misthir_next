import { Schema, model, models, Document, Types } from "mongoose";

export interface SearchDoc extends Document {
  term: string;
  frequency: number;
  user_id?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const searchSchema = new Schema<SearchDoc>({
    term: { type: String, required: true },
    frequency: { type: Number, default: 1 },
    user_id: { type: Schema.Types.ObjectId, ref: "User", default: null },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export const Search = models.Search || model<SearchDoc>("Search", searchSchema);

export interface SearchResultDoc extends Document {
  search_id: Types.ObjectId;
  module: "Blog" | "Destination" | "Product" | "Page";
  module_id: Types.ObjectId;
  frequency: number;
  user_id?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const searchResultSchema = new Schema<SearchResultDoc>({
    search_id: { type: Schema.Types.ObjectId, ref: "Search", required: true },
    module: { type: String, enum: ["Blog", "Destination", "Product", "Page"], required: true },
    module_id: { type: Schema.Types.ObjectId, required: true, refPath: "module" },
    frequency: { type: Number, default: 1 },
    user_id: { type: Schema.Types.ObjectId, ref: "User", default: null },
  }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export const SearchResult = models.SearchResult || model<SearchResultDoc>("SearchResult", searchResultSchema);