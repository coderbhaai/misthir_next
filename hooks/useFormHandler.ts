import React from "react";

type InputElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export function useFormHandler<T>(setState: React.Dispatch<React.SetStateAction<T>>) {
  // Overloaded implementation: can accept an event OR (key, value) directly
  return (
    eOrKey: React.ChangeEvent<InputElement> | keyof T,
    directValue?: any
  ) => {
    // Case 1: Called directly with a field name and value (e.g. StatusSelect)
    if (typeof eOrKey === "string" || typeof eOrKey === "number" || typeof eOrKey === "symbol") {
      setState((prev) => ({ ...prev, [eOrKey]: directValue }));
      return;
    }

    // Case 2: Standard DOM event from standard inputs
    const { name, value } = eOrKey.target;
    setState((prev) => ({
      ...prev,
      [name]: value === "true" ? true : value === "false" ? false : value,
    }));
  };
}

// Keep your useSetForm if needed elsewhere
type SetValue<T> = (key: keyof T, value: any) => void;

export function useSetForm<T>(setState: React.Dispatch<React.SetStateAction<T>>) {
  return <K extends keyof T>(key: K, value: T[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };
}