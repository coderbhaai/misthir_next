import { ProductFeatureProps, SkuProductFeatureRelationItem } from "@amitkk/product/types";

export function extractFeatureValues<K extends keyof ProductFeatureProps>(
  inputArray: (SkuProductFeatureRelationItem | ProductFeatureProps | string)[] | undefined | null, 
  moduleName?: string, 
  field: K | "_id" = "_id"
): string[] {
  if (!Array.isArray(inputArray) || inputArray.length === 0) return [];

  return inputArray.map((item) => {
    if (!item) return null;
    if (typeof item === "string") {
      return item;
    }

    const featureObj = "productFeature_id" in item ? item.productFeature_id : item;

    if (featureObj && typeof featureObj === "object") {
      const feature = featureObj as ProductFeatureProps;
      if (moduleName && feature.module && feature.module.toLowerCase() !== moduleName.toLowerCase()) {
        return null;
      }
      
      if (field === "_id") {
        return feature._id?.toString() || feature._id?.toString() || null;
      }
      
      const val = feature[field];
      return val !== undefined && val !== null ? String(val) : null;
    }

    return null;
  }).filter((val): val is string => typeof val === "string" && val.length > 0);
}

export function filterAndExtractFeatures<T = string>(
  inputArray: (SkuProductFeatureRelationItem | ProductFeatureProps | any)[] | undefined | null,
  moduleName?: string,
  field: string | ((feature: any) => any) = "_id"
): T[] {
  if (!Array.isArray(inputArray) || inputArray.length === 0) return [];

  return inputArray
    .map((item) => {
      if (!item) return null;

      // If it's just a raw string/ID, return it directly if no strict module filtering is required
      if (typeof item === "string") {
        return moduleName ? null : item;
      }

      // Resolve nested relation schema structures (e.g., productFeature_id populated)
      const featureObj = "productFeature_id" in item ? item.productFeature_id : item;

      if (featureObj && typeof featureObj === "object") {
        const feature = featureObj as any;

        // Apply module filter if specified
        if (moduleName && feature.module && feature.module.toLowerCase() !== moduleName.toLowerCase()) {
          return null;
        }

        // If field is a custom callback function, invoke it
        if (typeof field === "function") {
          return field(feature);
        }

        // Extract specific field (like "name", "_id", etc.)
        if (field === "_id") {
          return feature._id?.toString() || null;
        }

        const val = feature[field];
        return val !== undefined && val !== null ? val : null;
      }

      return null;
    })
    .filter((val): val is T => val !== null && val !== undefined && (typeof val !== "string" || val.length > 0));
}