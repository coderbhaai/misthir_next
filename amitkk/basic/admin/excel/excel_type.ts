import { OptionProps } from "@amitkk/basic/types/generic";
import { UnresolvedField } from "@amitkk/basic/types/shared";

export interface StatusAction {
  label: string;
  action: () => void;
  color?: "primary" | "secondary" | "success" | "error" | "warning";
};

export interface ProductStatusTempProps {
    _id: string;
    excelUpload_id: string;
    status: string;
    message: string;
    migration_status?: boolean;
    migration_id?: string;

    item_code?: string;
    item_code_id?: string | OptionProps;
    sku_name?: string;
    sku_id?: string | OptionProps;
    sku_status?: string;
    unresolved?: UnresolvedField[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ProductTypeTempProps {
    _id: string;
    excelUpload_id: string;
    status: string;
    message: string;
    migration_status?: boolean;
    migration_id?: string;

    item_code?: string;
    item_code_id?: string | OptionProps;
    sku_name?: string;
    sku_id?: string | OptionProps;
    product_id?: string | OptionProps;
    category_name?: string;
    subcategory_name?: string;
    unresolved?: UnresolvedField[];
    createdAt: Date;
    updatedAt: Date;

    details?: ProductTypeTempDetail[];
}

export interface ProductTypeTempDetail {
  productType_id: {
    _id: string;
    name: string;
    module: string;
  };
}
