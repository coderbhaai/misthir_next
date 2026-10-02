export interface GenericModule {
  _id: string;
  url: string;
  name: string;
}

export interface OptionProps {
  _id:  string;
  name: string;
}

export interface EmailRegisterProps {
  role?: string;
  attachUser?: boolean;
  saveUser?: boolean;
  handleUpdate: () => void;
}

export interface SidebarFilterProps {
  selected: Record<string, string[]>;
  onChange: (payload: {
    key: string;
    values: string[];
    lastSelected?: string;
  }) => void;
  search: string;
  onSearchChange: (val: string) => void;
}

export interface ModuleProps{
    _id: string
    module: string;
    name: string;
    url: string;
}