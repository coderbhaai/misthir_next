"use client";

import React, { useEffect, useRef, useState } from "react";
import { apiRequest } from "@amitkk/basic/utils/my-utils/admin-utils";
import { X } from "lucide-react"; // Imported Lucide icon
import AddActionButton from "@amitkk/components/ui/AddSideActionButton";

type AnyObj = Record<string, any>;

type Props<T> = {
  value: string | null;
  onChange: (value: string) => void;

  label?: string;
  required?: boolean;
  disabled?: boolean;

  endpoint: string;
  listFunction: string;
  singleFunction: string;

  parentId?: string | string[];
  filters?: Record<string, string | string[] | null | undefined>;

  getOptionLabel: (item: T) => string;
  renderFooter?: (onClose: () => void) => React.ReactNode;

  refreshKey?: number;
  actionTitle?: string;
  onActionClick?: () => void;
  options?: T[];
};

export default function SingleAsyncDropdown<T extends AnyObj>({
  value,
  onChange,
  label,
  required,
  disabled,
  endpoint,
  listFunction,
  singleFunction,
  parentId,
  filters,
  getOptionLabel,
  renderFooter,
  refreshKey,
  actionTitle = "Add",
  onActionClick,
  options: initialOptions,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [focused, setFocused] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [options, setOptions] = useState<T[]>(initialOptions ?? []);
  useEffect(() => {
    if (initialOptions) { setOptions(initialOptions); }
  }, [initialOptions]);

  const isUserTypingRef = useRef(false);
  const lastHydratedValueRef = useRef<string | undefined>(undefined);
  const isSelectingRef = useRef(false);

  const hasValue = !!inputValue?.trim();
  const floating = focused || open || hasValue;
  const finalLabel = label || "";

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (isSelectingRef.current) { isSelectingRef.current = false; return; }

    debounceRef.current = setTimeout(() => {
      fetchOptions(inputValue);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputValue, parentId, refreshKey, JSON.stringify(filters)]);

  const fetchOptions = async (search = "") => {
    if (initialOptions) {
      const filtered = initialOptions.filter((item) =>
        getOptionLabel(item)
          .toLowerCase()
          .includes(search.toLowerCase())
      );

      setOptions(filtered);
      return;
    }

    try {
      setLoading(true);
      const normalizedParentId = Array.isArray(parentId) ? parentId : parentId ? [parentId] : [];
      const normalizedFilters = Object.entries(filters || {}).reduce(
        (acc, [key, val]) => {
          acc[key] = JSON.stringify(Array.isArray(val) ? val : val ? [val] : []);
          return acc;
        },
        {} as Record<string, string>
      );

      const res = await apiRequest("POST", endpoint, {
        function: listFunction,
        search,
        parent_id: JSON.stringify(normalizedParentId),
        selected_id: value,
        ...normalizedFilters,
      });

      const data = Array.isArray(res?.data) ? res.data : [];
      setOptions(data);
    } catch (err) { 
      console.error(`❌ [${label} Dropdown] fetch error`, err); 
      setOptions([]); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    if (!value || value === "null" || value === "undefined" || value === "") { 
      setInputValue(""); 
      lastHydratedValueRef.current = "";
      return; 
    }
    if (isUserTypingRef.current && value === lastHydratedValueRef.current) { return; }

    const hydrate = async () => {
      const existing = options.find((o) => String((o as any)._id) === String(value));
      if (existing) { 
        const matchedLabel = getOptionLabel(existing);
        setInputValue(matchedLabel); 
        lastHydratedValueRef.current = value;
        isUserTypingRef.current = false;
        return; 
      }

      try {
        const res = await apiRequest("POST", endpoint, {
          function: singleFunction,
          id: value,
        });

        const item = res?.data;
        if (item) {
          const fetchedLabel = getOptionLabel(item);
          setInputValue(fetchedLabel);
          lastHydratedValueRef.current = value;
        }
      } catch (err) {
        console.error(`❌ [${label} Dropdown] deep hydration error`, err);
      } finally {
        isUserTypingRef.current = false; 
      }
    };

    hydrate();
  }, [value, endpoint, singleFunction]);

  useEffect(() => {
    if (!value || value === "null" || value === "undefined") { 
      setInputValue(""); 
    }
    
    setOpen(false);
    if (!initialOptions) {
      fetchOptions("");
    }
  }, [parentId, refreshKey, JSON.stringify(filters)]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!open) return;
      const target = e.target as Node;
      if (wrapperRef.current?.contains(target)) return;
      
      setOpen(false);
      if (inputValue.trim() === "") { onChange(""); }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [open, inputValue]);

  const handleSelect = (item: T) => {
    const targetId = (item as any)._id;
    const targetLabel = getOptionLabel(item);
    
    isUserTypingRef.current = false;
    lastHydratedValueRef.current = targetId;
    isSelectingRef.current = true;
    
    onChange(targetId);
    setInputValue(targetLabel);
    setOpen(false);
  };

  // Clear handler logic
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputValue("");
    onChange("");
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="row relative w-full">
      <div className={onActionClick && !disabled ? "col-span-12 md:col-span-10" : "col-span-12"}>
        <div style={{ position: "relative" }}>
          <input
            value={inputValue}
            disabled={disabled}
            placeholder=""
            autoComplete="one-time-code"
            onClick={() => !disabled && setOpen(true)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => {
              isUserTypingRef.current = true;
              const nextVal = e.target.value;
              setInputValue(nextVal);
              if (nextVal.trim() === "") {
                onChange("");
              }
              
              if (!open) setOpen(true);
            }}
            style={{
              display: "block",
              height: "56px",
              width: "100%",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
              backgroundColor: disabled ? "#f3f4f6" : "#ffffff",
              color: disabled ? "#9ca3af" : "#111827",
              paddingLeft: "16px",
              paddingRight: hasValue && !disabled ? "40px" : "16px",
              fontSize: "14px",
              outline: "none",
              cursor: disabled ? "not-allowed" : "text",
              boxSizing: "border-box",
              fontFamily: "inherit",
              transition: "border-color 0.15s ease",
            }}
          />
          
          {finalLabel && (
            <label
              style={{
                position: "absolute",
                left: "12px",
                background: "#fff",
                padding: "0 6px",
                transition: "all 0.2s ease",
                pointerEvents: "none",
                color: "#6b7280",
                fontSize: floating ? "12px" : "14px",
                top: floating ? "-8px" : "50%",
                transform: floating ? "none" : "translateY(-50%)",
                zIndex: 10,
              }}
            >
              {finalLabel}{" "}
              {required && <span style={{ color: "#ef4444" }}>*</span>}
            </label>
          )}

          {hasValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9ca3af",
                borderRadius: "50%",
                transition: "color 0.15s ease, background-color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#4b5563";
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#9ca3af";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {open && (
          <div
            style={{
              position: "absolute",
              zIndex: 50,
              marginTop: "8px",
              maxHeight: "280px",
              width: "100%",
              overflow: "auto",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              backgroundColor: "#ffffff",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
            }}
          >
            {loading && <div style={{ padding: "12px", fontSize: "14px" }}>Loading...</div>}
            {!loading && options.length === 0 && (
              <div style={{ padding: "12px", fontSize: "14px" }}>No options</div>
            )}

            {!loading &&
              options.map((opt, idx) => (
                <div 
                  key={(opt as any)._id ?? idx} 
                  onClick={() => handleSelect(opt)} 
                  style={{ padding: "12px", cursor: "pointer", fontSize: "14px" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {getOptionLabel(opt)}
                </div>
              ))}

            {renderFooter && renderFooter(() => setOpen(false))}
          </div>
        )}
      </div>

      {onActionClick && !disabled && ( <AddActionButton variant="menuItem" title={actionTitle} onClick={onActionClick}/> )}
    </div>
  );
}