"use client";

import SingleAsyncDropdown from "@amitkk/components/admin/SingleAsyncDropdown";

interface User {
  _id: string;
  name?: string;
}

type Props = {
  label?: string;
  value: string | null;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  actionTitle?:string;
  onAddAction?: () => void;
  refreshKey?: number;
  filters?: Record<string, string | string[] | null | undefined>;
};

export default function SingleUserDropdown({label = "User", value, onChange, required, filters, disabled, actionTitle="Add User", onAddAction, refreshKey }: Props) {
  return (
    <SingleAsyncDropdown<User>
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      label={label}
      endpoint="basic/spatie"
      listFunction="get_user_options"
      singleFunction="get_single_user"
      getOptionLabel={(o) => o?.name || ""}
      filters={filters}
      actionTitle={actionTitle}
      onActionClick={onAddAction}
      refreshKey={refreshKey}
    />
  );
}