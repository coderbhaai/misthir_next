import { FC } from "react";
import BlockFilter from "./BlockFilter";
import SearchFilter from "./SearchFilter";
import StatusFilter from "./StatusFilter";
import ModuleFilter from "./ModuleFilter";
import ModuleIdFilter from "./ModuleIdFilter";
import PermissionFilter from "./PermissionFilter";
import RoleFilter from "./RoleFilter";
import UserFilter from "./UserFilter";
import GenericFilter from "./GenericFilter";
import ProductTypeFilter from "./ProductTypeFilter";
import ProductBrandFilter from "./ProductBrandFilter";

export const FILTER_COMPONENTS: Record<string, FC<any>> = {
  BlockFilter,
  StatusFilter,
  SearchFilter,
  ModuleFilter,
  ModuleIdFilter,
  RoleFilter,
  PermissionFilter,
  UserFilter,
  GenericFilter,
  ProductTypeFilter,
  ProductBrandFilter,
};

export const FILTER_META: Record<string, { field: string; operator?: "eq" | "contains" | "in" }> = {
  SearchFilter: { field: "search", operator: "contains" },
  StatusFilter: { field: "status", operator: "eq" },
  BlockFilter: { field: "block_id", operator: "eq" },
  ModuleFilter: { field: "module", operator: "eq" },
  ModuleIdFilter: { field: "module_id", operator: "eq" },
  PermissionFilter: { field: "permission_id", operator: "eq" },
  RoleFilter: { field: "role_id", operator: "eq" },
  LeadStatusFilter: { field: "lead_status", operator: "eq" },
  UserFilter: { field: "user_id", operator: "eq" },
  GenericFilter: { field: "user_id", operator: "eq" },
  portfolio_filter: { field: "module", operator: "eq" },
  ProductTypeFilter: { field: "productType_id", operator: "eq" },
  ProductBrandFilter: { field: "productBrand_id", operator: "eq" },
};

export function getFilterFieldMeta(filterConfig: { name: string; props?: Record<string, any> }) {
  const meta = FILTER_META[filterConfig.name] || { field: filterConfig.name, operator: "eq" };
  const dynamicField = filterConfig.props?.filterKey || meta.field;
  
  return { field: dynamicField, operator: meta.operator || "eq" };
}