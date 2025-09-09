  import mongoose, { Schema, Document, Types, model } from 'mongoose';
  import { ArrayProps, MediaProps, ModuleProps, SkuDetailProps, SkuFlavorColorProps, SkuProps } from '../types';

  export interface ProductDocument extends Document {
    name: string;
    url: string;
    vendor_id?: Types.ObjectId;
    meta_id?: Types.ObjectId;
    gtin: string;
    dietary_type : string;
    short_desc?: string;
    long_desc?: string;
    status: boolean;
    displayOrder?: number;
    adminApproval: boolean;
    createdAt: Date;
    updatedAt: Date;
    productMeta?: { _id: string | Types.ObjectId; productmeta_id?: ModuleProps; }[];
    metas?: { _id: string; module: string; name: string; url: string; }[];
    productFeature?: { _id: string | Types.ObjectId; productFeature_id?: ModuleProps; }[];
    features?: ArrayProps[];
    productIngridient?: { _id: string | Types.ObjectId; ingridient_id?: ModuleProps; }[];
    ingridients?: ArrayProps[];
    productBrand?: { _id: string | Types.ObjectId; productBrand_id?: ModuleProps; }[];
    brands?: ArrayProps[];
    mediaHubs?: { _id: string | Types.ObjectId; media_id?: MediaProps }[];
    medias?: MediaProps[];
    sku?: {
      _id: string | Types.ObjectId;
      details?: SkuDetailProps | null;
      flavors?: { productFeature_id?: ModuleProps  }[];
      colors?: { productFeature_id?: ModuleProps  }[];
    }[];
    skus?: SkuProps[];
  }

  const hiddenFields = [ "productMeta", "productFeature", "productIngridient", "productBrand", "mediaHubs", "sku" ];
  const productSchema = new Schema<ProductDocument>({
    name: { type: String, required: true },
    url: { type: String, required: true, unique: true },
    gtin: { type: String, required: false },
    dietary_type : { type: String, required: true },
    vendor_id: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    meta_id: { type: Schema.Types.ObjectId, ref: 'Meta' },
    status: { type: Boolean, default: true },
    displayOrder: { type: Number, required: false, },
    adminApproval: { type: Boolean, default: true },
    short_desc: { type: String, required: false },
    long_desc: { type: String, required: false },
  }, { timestamps: true, toJSON: {
  virtuals: true,
  transform: (_, ret) => {
    const obj = ret as Record<string, any>;

    hiddenFields.forEach(field => {
      if (obj[field] !== undefined) {
        delete obj[field];
      }
    });

    return obj;
  }
}, toObject: { virtuals: true } });

  productSchema.virtual('productFeature', { ref: 'ProductProductFeature', localField: '_id', foreignField: 'product_id', justOne: false });
  productSchema.virtual("features").get(function (this: ProductDocument) {
    return this.productFeature?.map((i: any) =>
      i.productFeature_id ? (({ _id, module, name, url }) => ({ _id: String(_id), module, name, url }))(i.productFeature_id) : null
    ).filter(Boolean) || [];
  });

  productSchema.virtual('productIngridient', { ref: 'ProductIngridient', localField: '_id', foreignField: 'product_id', justOne: false });
  productSchema.virtual("ingridients").get(function (this: ProductDocument) {
    return this.productIngridient?.map((i: any) =>
      i.ingridient_id ? (({ _id, name, url }) => ({ _id: String(_id), name, url }))(i.ingridient_id) : null
    ).filter(Boolean) || [];
  });

  productSchema.virtual("mediaHubs", { ref: "MediaHub", localField: "_id", foreignField: "module_id", justOne: false, match: { module:  "Product" } });
  productSchema.virtual("medias").get(function (this: ProductDocument) {
    return this.mediaHubs?.map((i: any) =>
      i.media_id ? (({ _id, path, alt, cloudflare }) => ({ _id: String(_id), path, alt, cloudflare }))(i.media_id) : null
    ).filter(Boolean) || [];
  });

  productSchema.virtual("sku", { ref: "Sku", localField: "_id", foreignField: "product_id", justOne: false });
  productSchema.virtual("skus").get(function (this: ProductDocument) {
    const pickPF = (pf: any) =>
      pf && pf.name
      ? {
          _id: String(pf._id),
          module: pf.module,
          name: pf.name,
          url: pf.url,
        } : null;

  const pickPFListByModule = (list: any[], wantModule: 'Flavor' | 'Color') =>
    (list || []).map((x: any) => x?.productFeature_id).filter((pf: any) => pf && pf.module === wantModule)
      .map((pf: any) => ({
        _id: String(pf._id), 
        module: pf.module,
        name: pf.name,
        url: pf.url,
      }));

    return this.sku?.map((i: any) => ({
      _id: String(i._id),
      name: i.name,
      price: i.price,
      inventory: i.inventory,
      status: i.status,
      displayOrder: i.displayOrder,
      adminApproval: i.adminApproval,
      details: i.details || null,
      
      eggless_id: i.eggless_id,
      sugarfree_id: i.sugarfree_id,
      gluttenfree_id: i.gluttenfree_id,    
      flavors: pickPFListByModule(i.flavors, 'Flavor'),
      colors:  pickPFListByModule(i.colors,  'Color'),

    })) || [];
  });

  
  productSchema.virtual('productBrand', { ref: 'ProductProductBrand', localField: '_id', foreignField: 'product_id', justOne: false });
  productSchema.virtual("brands").get(function (this: ProductDocument) {
    return this.productBrand?.map((i: any) =>
      i.productBrand_id ? (({ _id, name, url }) => ({ _id: String(_id), name, url }))(i.productBrand_id) : null
    ).filter(Boolean) || [];
  });

  productSchema.virtual('productMeta', { ref: 'ProductProductmeta', localField: '_id', foreignField: 'product_id', justOne: false });
  productSchema.virtual("metas").get(function (this: ProductDocument) {
    return this.productMeta?.map((i: any) =>
      i.productmeta_id ? (({ _id, module, name, url }) => ({ _id, module, name, url }))(i.productmeta_id) : null
    ).filter(Boolean) || [];
  });

export default mongoose.models.Product || model<ProductDocument>('Product', productSchema);