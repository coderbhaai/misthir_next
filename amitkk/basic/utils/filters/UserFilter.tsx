"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useFilterContext } from "contexts/FilterContext";
import { apiRequest } from "../my-utils/admin-utils";
import { getFilterFieldMeta } from "../filters";
import OpenSelect from "@amitkk/components/basic/OpenSelect";

export interface UserFilterProps {
  filterKey?: string;
  label?: string;
  role?: string | string[];
  placeholder?: string;
  [key: string]: any;
}

interface UserOption {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
}

export interface FetchUsersPayload {
  role?: string | string[];
  search?: string;
  selected_id?: string;
  limit?: number;
}

export const fetchUserOptions = async (payload: FetchUsersPayload) => {
  const res = await apiRequest("POST", "basic/spatie?function=get_user_options", payload);
  return res?.data ?? [];
};

export default function UserFilter(props: UserFilterProps) {
  const { label = "User", role, placeholder } = props;
  const { filters, setFilter } = useFilterContext();
  const { field } = getFilterFieldMeta({ name: "UserFilter", props });
  const selectedValue = String(filters[field] || "");

  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUserDoc, setSelectedUserDoc] = useState<UserOption | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loadUsers = useCallback(async (searchQuery: string) => {
    setLoading(true);
    try {
      const result = await fetchUserOptions({
        role,
        search: searchQuery,
        selected_id: selectedValue || undefined,
        limit: 20,
      });
      const fetchedUsers: UserOption[] = Array.isArray(result) ? result : [];
      setUsers(fetchedUsers);

      if (selectedValue) {
        const match = fetchedUsers.find((u) => String(u._id) === selectedValue);
        if (match) setSelectedUserDoc(match);
      }
    } catch (error) {
      console.error("Failed to load user options:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(role), selectedValue]);

  useEffect(() => { loadUsers(""); }, [loadUsers]);

  const handleSearchChange = (query: string) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      loadUsers(query);
    }, 300);
  };

  const combinedUsers = [...users];
  if (selectedValue && selectedUserDoc && !combinedUsers.some((u) => String(u._id) === selectedValue)) {
    combinedUsers.unshift(selectedUserDoc);
  }

  const options = combinedUsers.map((u) => {
    const contactInfo = u.email || u.phone;
    return {
      label: u.name ? `${u.name}${contactInfo ? ` (${contactInfo})` : ""}` : contactInfo || "Unknown User",
      value: u._id,
    };
  });

  return (
    <OpenSelect
      name={field}
      label={label}
      showLabel={false}
      value={selectedValue}
      placeholder={loading && users.length === 0 ? "Loading..." : placeholder || `All ${label}s`}
      onChange={(val: any) => {
        setFilter("UserFilter", val, props);
        if (!val) setSelectedUserDoc(null);
      }}
      onSearchChange={handleSearchChange}
      options={options}
      disabled={loading && users.length === 0}
    />
  );
}