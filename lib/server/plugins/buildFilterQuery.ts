import { Document, FilterQuery, Types } from "mongoose";

export interface BuildFilterOptionsGeneric {
  searchableFields?: string[];
  defaultLimit?: number;
  maxLimit?: number;
  
  objectIdFields?: string[];
  booleanFields?: string[];
  exactFields?: string[];
  arrayFields?: string[];
  ignoreKeys?: string[];
}

export function buildFilterQuery<T extends Document>(
  filters: Record<string, any> = {}, 
  options?: BuildFilterOptionsGeneric & { page?: number; limit?: number }
): {
  matchQuery: FilterQuery<T>;
  skip: number;
  limit: number;
} {
  const page = Math.max(Number(options?.page ?? filters.page ?? 0), 0);
  const limitRaw = Number(
    options?.limit ?? filters.limit ?? options?.defaultLimit ?? 10
  );
  const limit = Math.min(limitRaw, options?.maxLimit ?? 100);
  const skip = page * limit;

  const query: FilterQuery<T> = {};
  const {
    searchableFields = [],
    objectIdFields = [],
    booleanFields = [],
    exactFields = [],
    arrayFields = [],
    ignoreKeys = [],
  } = options || {};

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") continue;
    if (key === "page" || key === "limit") continue;
    if (ignoreKeys.includes(key)) continue;

    if (key === "user_id" || key === "seller_id") {
      if (Types.ObjectId.isValid(value)) {
        const objectIdVal = new Types.ObjectId(value);
        (query as any).$or = (query as any).$or || [];
        (query as any).$or.push(
          { user_id: objectIdVal }, 
          { seller_id: objectIdVal }
        );
      }
      continue;
    }

    const isIdField = key.endsWith('_id') || objectIdFields.includes(key);
    if (isIdField) {
      if (Array.isArray(value)) {
        const validIds = value
          .filter((v) => Types.ObjectId.isValid(v))
          .map((v) => new Types.ObjectId(v));
          
        if (validIds.length > 0) {
          (query as any)[key] = { $in: validIds };
        }
      } else if (typeof value === "object" && value !== null) {
        (query as any)[key] = value;
      } else if (Types.ObjectId.isValid(value)) {
        (query as any)[key] = new Types.ObjectId(value);
      }
      continue;
    }

    if (key === "search" && searchableFields.length) {
      (query as any).$or = searchableFields.map((f) => ({
        [f]: { $regex: value, $options: "i" },
      }));
      continue;
    }

    if (booleanFields.includes(key)) {
      (query as any)[key] =
        value === true ||
        value === "true" ||
        value === 1 ||
        value === "1";
      continue;
    }

    if (arrayFields.includes(key) && Array.isArray(value)) {
      (query as any)[key] = { $in: value };
      continue;
    }

    if (exactFields.includes(key)) {
      (query as any)[key] = value;
      continue;
    }

    if (key === "from_date" || key === "to_date") {
      (query as any).createdAt ||= {};
      if (filters.from_date) {
        (query as any).createdAt.$gte = new Date(filters.from_date);
      }
      if (filters.to_date) {
        (query as any).createdAt.$lte = new Date(filters.to_date);
      }
      continue;
    }

    if (key === "excelFilter_status") {
      (query as any).status = value;
      continue;
    }
    
    (query as any)[key] = value;
  }

  return { matchQuery: query, skip, limit };
}