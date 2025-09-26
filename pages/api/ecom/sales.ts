import mongoose, { isValidObjectId, Types } from 'mongoose';
import { createApiHandler, ExtendedRequest } from '../apiHandler';
import { NextApiRequest, NextApiResponse } from 'next';
import { fetchData, log } from '../utils';
import Sale from 'lib/models/ecom/Sale';
import SaleSku from 'lib/models/ecom/SaleSku';
import Product from 'lib/models/product/Product';
import { SkuDocument } from 'lib/models/product/Sku';

export async function get_all_sales(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { vendor_id } = req.query;
    const filter: Record<string, any> = {};

    if (vendor_id && mongoose.Types.ObjectId.isValid(vendor_id as string)) {
      filter.vendor_id = new mongoose.Types.ObjectId(vendor_id as string);
    }

    const data = await Sale.find(filter)
      .populate([
        { path: "vendor_id" },
        {
          path: "saleSkus",
          populate: [
            { path: "sku_id" },
            {
              path: "product_id",
              populate: [
                {
                  path: "mediaHubs",
                  populate: { path: "media_id" },
                },
              ],
            },
          ],
        },
      ])
      .exec();

    const salesWithCounts = data.map((sale) => {
      const totalSkus = sale.saleSkus?.length || 0;

      // filter out null product_ids before toString
      const productIds = new Set(
        sale.saleSkus
          .map(
            (sku: { product_id?: { toString: () => string } | null }) =>
              sku.product_id ? sku.product_id.toString() : null
          )
          .filter((id: string | null): id is string => id !== null)
      );

      const totalProducts = productIds.size;

      return {
        ...sale.toObject(),
        totalSkus,
        totalProducts,
      };
    });

    return res.status(200).json({ message: "Sales Fetched", data: salesWithCounts });
  } catch (error) {
    return log(error);
  }
}

export async function get_single_sale(req: NextApiRequest, res: NextApiResponse){
  try{
    const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;  
    if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }

    const { vendor_id } = req.query;
    const filter: Record<string, any> = {};

    filter._id = new mongoose.Types.ObjectId(id);
    if (vendor_id && mongoose.Types.ObjectId.isValid(vendor_id as string)) {
      filter.vendor_id = new mongoose.Types.ObjectId(vendor_id as string);
    }

    const data = await Sale.findOne(filter)
      .populate([ { path: 'vendor_id' }, { path: 'saleSkus', populate: [ { path: 'sku_id' }, { path: 'product_id', populate: [ { path: 'mediaHubs', populate: { path: 'media_id' } } ] } ]  }]).lean(false).exec();
  
    if (!data) { return res.status(404).json({ message: `Sales with ID ${id} not found` }); }
    return res.status(200).json({ message: 'Fetched Single Sale', data });
  }catch (error) { return log(error); }
};

export async function create_update_sale(req: ExtendedRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }

    const data = req.body;
    if ( !data?.name || !data?.vendor_id || !data?.valid_from || !data?.valid_to || !data?.type || !data?.discount || !data?.status  ) { 
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;
    const {name, vendor_id, valid_from, valid_to, type, discount, status } = data;

    const skus = JSON.parse(data.skus || []);

    if (modelId && isValidObjectId(modelId)) {
      try {
        const updated = await Sale.findByIdAndUpdate( modelId, {
          vendor_id: data.vendor_id,
          name: data.name,
          valid_from: data.valid_from,
          valid_to: data.valid_to,
          type: data.type,
          discount: data.discount ? Number(data.discount) : 0,
          status: data.status,
          updatedAt: new Date(),
        }, { new: true } );

        if (Array.isArray(skus)) {
          for (const skuData of skus) {
            await upsertSaleSku({ ...skuData, sale_id: updated._id });
          }
        }

        if (updated) {
          return res.status(200).json({ message: 'Entry updated successfully', data: updated });
        } else {
          return res.status(404).json({ message: 'Entry not found for update' });
        }
      } catch (error) { log(error); }
    }

    const newEntry = new Sale({
        vendor_id: data.vendor_id,
        name: data.name,
        valid_from: data.valid_from,
        valid_to: data.valid_to,
        type: data.type,
        discount: data.discount ? Number(data.discount) : 0,
        status: data.status,
        createdAt: new Date(),
    });
    await newEntry.save();

    if (Array.isArray(skus)) {
      for (const skuData of skus) {
        await upsertSaleSku({ ...skuData, sale_id: newEntry._id });
      }
    }

    return res.status(200).json({ message: 'Entry Created successfully', data: newEntry });

  } catch (error) { log(error); }
}

interface UpsertSaleInput {
  _id?: string;
  sale_id: string | Types.ObjectId;
  sku_id: string | Types.ObjectId;
  product_id: string | Types.ObjectId;
  quantity: number;
  discount: number;
}

export async function upsertSaleSku(data: UpsertSaleInput) {
  try {
    const filter = {
      sale_id: data.sale_id,
      product_id: data.product_id,
      sku_id: data.sku_id,
    };

    const update = {
      $set: {
        quantity: data.quantity,
        discount: data.discount,
        updatedAt: new Date(),
      },
    };

    const options = { new: true, upsert: true };

    const sku = await SaleSku.findOneAndUpdate(filter, update, options);
    return sku;
  } catch (error) { log(error); throw error; }
}

interface MediaProps {
  _id: Types.ObjectId | string;
  path: string;
  alt?: string;
}

interface SkuProps {
  _id: Types.ObjectId | string;
  name: string;
  price: number;
}

interface ProductSaleProps {
  _id: Types.ObjectId | string;
  name: string;
  url: string;
  mediaHubs?: {
    media_id: MediaProps;
  }[];
  sku: SkuProps[];
}

export async function get_product_sale_modules(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { vendor_id } = req.query;
    const filter: any = {};
    if (vendor_id && mongoose.Types.ObjectId.isValid(vendor_id as string)) {
      filter.vendor_id = new mongoose.Types.ObjectId(vendor_id as string);
    }

    const data: ProductSaleProps[] = await fetchData<ProductSaleProps>(Product, {
      filter,
      sort: { name: 1 },
      lean: false,
      select: "_id name url",
      populate: [
        { path: "mediaHubs", populate: { path: "media_id", model: "Media", select: "_id path alt" }, },
        { path: "sku", select: "_id name price" },
      ],
    });

    return res.status(200).json({ message: 'Fetched all Products', data });
  } catch (error) { return log(error); }
}

export async function getEffectiveSkuPrice(sku: SkuDocument, vendorId: Types.ObjectId): Promise<number> {
  if (!sku?.price) return 0;

  const now = new Date();
  const activeSales = await Sale.find({
    vendor_id: vendorId,
    valid_from: { $lte: now },
    valid_to: { $gte: now },
    status: true,
  }).sort({ valid_from: 1 }).populate("saleSkus");

  let finalPrice = Number(sku.price);
  
  const applicableSale = activeSales.find((sale: any) =>
    (sale as any).saleSkus.some((s: any) => s.sku_id.toString() === (sku._id as Types.ObjectId).toString())
  );

  if (applicableSale) {
    const saleSku = (applicableSale as any).saleSkus.find(
      (s: any) => s.sku_id.toString() === (sku._id as Types.ObjectId).toString()
    );

    const discount = Number(saleSku.discount);

    if (applicableSale.type === "Amount Based") {
      finalPrice = Math.max(0, finalPrice - discount);
    } else if (applicableSale.type === "Percent Based") {
      finalPrice = finalPrice - (finalPrice * discount) / 100;
    }
  }

  return parseFloat(finalPrice.toFixed(2));
}

const functions = {
  get_all_sales,
  get_single_sale,
  create_update_sale,
  get_product_sale_modules
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions);