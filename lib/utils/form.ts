export const createFormUpdater =
  (setFormData: React.Dispatch<React.SetStateAction<any>>) =>
  (name: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

export const extractId = <T extends { _id?: any }>(
  value: string | T | null | undefined
): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value._id) return value._id.toString();
  return "";
};