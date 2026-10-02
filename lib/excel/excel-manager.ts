export type ExcelTypeKey = "meta";

export interface ExcelModuleConfig {
  key: string;               
  label: string;             
  backendType: string; 
  templateHref: string | null;      
  routeSlug: string;         
  route: string;             
  requiresCountryExport?: boolean;
  requiresDmcExport?: boolean;
  requiresDmcImport?: boolean;
}

export const EXCEL_MANAGER: Record<string, ExcelModuleConfig> = {
  meta: {
    key: "meta",
    label: "meta",
    backendType: "meta",
    templateHref: "/storage/files/meta-upload.xlsx",
    routeSlug: "meta",
    route: "meta",
    requiresDmcExport: false,
    requiresDmcImport: false,
  },
};

export function getExcelConfig(typeToken?: string): ExcelModuleConfig {
  if (!typeToken) return EXCEL_MANAGER.meta;
  const cleanToken = typeToken.toLowerCase().trim().replace("-", "_");
  if (EXCEL_MANAGER[cleanToken]) return EXCEL_MANAGER[cleanToken];

  const matched = Object.values(EXCEL_MANAGER).find(
    (item) => 
      item.backendType.toLowerCase() === cleanToken ||
      item.routeSlug.toLowerCase() === cleanToken ||
      item.key.toLowerCase() === cleanToken
  );
  return matched || EXCEL_MANAGER.meta;
}

export function isValidExcelType(type: any): string | boolean {
  if (typeof type !== "string") return false;
  const cleanType = type.trim().toLowerCase().replace("-", "_");
  return Object.values(EXCEL_MANAGER).some(
    (item) => 
      item.key.toLowerCase() === cleanType || 
      item.backendType.toLowerCase() === cleanType ||
      item.routeSlug.toLowerCase() === cleanType
  );
}