import { GenericModule } from "@amitkk/basic/types/generic";


export interface KeywordFormItem {
  _id?: string;
  keyword: string;
  primary: boolean;
}

// export interface KeywordRow {
//   module: string;
//   module_id: string;
// }

// export interface KeywordRow {
//   module: string;
//   module_id: string;
// }

export interface KeywordProps {
  _id: string;
  module: string;
  module_id: string | GenericModule;
  keyword: string;
  primary: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}